# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

L0158 is a Graffiticode language for building Learnosity assessment integrations. It compiles Graffiticode programs into Learnosity API requests (Items, Questions, Author APIs) and renders them via a React frontend.

## Project Structure

npm workspaces monorepo with two packages:

- **packages/api** — Express server (port 50158). Contains the compiler, routes, and serves the built frontend.
- **packages/app** — Published npm package (`@graffiticode/l0158`). Exports `Form` and `View` React components. Built as a Vite library with Tailwind CSS.

## Build & Run Commands

```bash
npm run build                         # Build app, then api, then static (lexicon + spec)
npm run dev                           # Dev server with Firestore emulator + local auth
npm start                             # Production start

# Testing (Jest + supertest, tests in packages/api/src/*.spec.js)
npx jest                              # Run all tests
npx jest packages/api/src/auth.spec.js  # Run a single test file

# Linting
npm run lint                          # Lint test/ directory (root)
npm run -w packages/api lint          # Lint api src/ and tools/

# Package-specific
npm run -w packages/app dev           # Vite dev server for app
npm run -w packages/app storybook     # Storybook on port 6006
npm run -w packages/api build-spec    # Build API docs from spec-md
```

## Compiler Architecture

The compiler (`packages/api/src/compiler.js`) extends `BasisCompiler` from `@graffiticode/basis`. It defines:

- **Checker** — semantic validation visitor with methods per AST node type
- **Transformer** — transforms AST nodes into Learnosity API requests

**AST node types:** `INIT`, `ITEMS`, `QUESTIONS`, `AUTHOR`, `HELLO`, `PROG`

**Builder functions** (injected at compiler startup with Learnosity SDK credentials):
- `buildInitItems` / `buildCreateItems` — from `items.js`
- `buildInitQuestions` / `buildCreateQuestions` — from `questions.js`
- `buildInitAuthor` / `buildCreateAuthor` — from `author.js`
- `buildDataApi` — from `dataapi.js`, calls Learnosity Data API

The lexicon (`src/lexicon.js`) defines language keywords: `init`, `items`, `questions`, `author`, `hello`. It is generated via `tools/build-lexicon.js` which merges basis lexicon with lang-specific entries.

### Control-flow attributes (set `options` via side effect)

A few arity-2 keywords don't emit fields into the output record — they mutate the Transformer's `options` so downstream transformers can read them. Template: the `ID` override at the bottom of `compiler.js`.

- `id` — sets `options["lrn-id"]`, required by ITEMS/QUESTIONS/AUTHOR (they error if unset).
- `save-to-itembank` — sets `options["save-to-itembank"]`. Read by ITEMS and QUESTIONS to decide whether to POST to the Learnosity Data API. Saved items always land as `status: "unpublished"`; publishing happens in the Learnosity Author Site UI, not from the DSL.

These must appear in the chain such that their Transformer runs before the consumer's resume fires. In practice they can be chained after `items`/`questions` (inside the continuation) because ITEMS/QUESTIONS visit the continuation first, then consult options.

### Preview (default) vs save to the item bank

Rendering is always through Questions API with inline question data, regardless of save state. Returning `type: "questions"` is the single code path. Two reasons this is correct today: Items API can't render unpublished items (error 20013 / no visibility), and L0158 doesn't yet use item-level features (shared stimulus, layout templates, passages) that would require Items API for fidelity. When those features land, published items will need to route through Items API from the bank.

By default `items [...]` writes nothing to the bank — it's a pure preview. Chain `save-to-itembank true` onto the items continuation to persist: the item POSTs to `/itembank/items` with `status: "unpublished"` (always a draft), and its questions POST to `/itembank/questions`. The save is a side effect for bank listing/search; the returned compile result still targets Questions API for rendering. Publishing a saved item is done from the Learnosity Author Site.

The branch logic lives in `buildCreateItems` (`items.js`) and `buildCreateQuestions` (`questions.js`).

Form.tsx retains an Items API render path (type `"items"`) for future use — e.g., previewing a published bank item directly — but the normal compile flow doesn't reach it.

## API Routes

- `GET /` — health check, returns "OK"
- `POST /compile` — accepts `{ item: {...} }` or array, runs through compiler, returns result
- `GET /form` — serves the SPA (index.html from built app)
- Static assets served from `dist/` and `public/`

## App Components

- **Form** (`lib/components/form/Form.tsx`) — renders Learnosity assessments by dynamically loading Learnosity scripts based on type (items/questions/author) and calling the appropriate Learnosity JS API
- **View** (`lib/view.jsx`) — SPA shell that reads URL params (id, access_token, origin, data), manages compilation workflow with SWR hooks, and communicates with parent iframe via `postMessage`
- **State** (`lib/lib/state.js`) — simple reducer-based state management
- **API client** (`lib/lib/api.js`) — HTTP utilities for compile and data endpoints

### Form mount points and signed-request shapes

Each Learnosity API expects a different mount and a differently-shaped signed request — Form.tsx branches on `state.data.type`:

| type | script | signed-request shape | DOM mount |
| :--- | :----- | :-------------------- | :-------- |
| `items` | items.learnosity.com | `{ security, request }` (nested) | `<span id="learnosity_assess" class="learnosity-item" data-reference="item-1">` |
| `questions` | questions.learnosity.com | flat — security fields and `questions[]` at top level | `<span class="learnosity-response question-<response_id>">` per question |
| `author` | authorapi.learnosity.com | `{ security, request }` (nested) | `<div id="learnosity-author">` |

Questions API validates the activity JSON against the DOM at init time (error 10001 "no matching DOM element" otherwise), so the Form defers init one animation frame after mount and retries until every expected `.learnosity-response.question-<response_id>` span exists.

The script-loading effect depends on `type`, so a URL-cached `?data=` that flips the type post-compile correctly swaps the loaded Learnosity SDK.

## Testing Patterns

Tests are colocated with source files (`*.spec.js`). Key testing utilities:
- `src/testing/lang.js` — `startLangApp()` spins up a test language server
- `src/testing/auth.js` — auth test helpers using `@graffiticode/auth/testing`
- `src/testing/fixture.js` — shared test data (TASK1, DATA1, etc.)
- `src/testing/firestore.js` — Firestore mock

## Environment Variables

- `AUTH_URL` — Auth service URL (default: `https://auth.graffiticode.org`)
- `LEARNOSITY_KEY` / `LEARNOSITY_SECRET` — Learnosity API credentials
- `FIRESTORE_EMULATOR_HOST` — Set for local dev (`127.0.0.1:8080`)
- `PORT` — Server port (default: `50158`)

## Deployment

Google Cloud Run via Cloud Build (`cloudbuild.yaml`). Learnosity secrets managed via GCP Secret Manager. Deploy commands in root `package.json`: `gcp:build`, `gcp:deploy`, `gcp:logs`.
