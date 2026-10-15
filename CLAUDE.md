# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

L0158 is a Graffiticode language for authoring Learnosity assessment items (deprecated in favour of L0176, still served). It compiles `items` and `questions` programs to one **unsigned**, render-ready Learnosity activity. L0158 holds **no Learnosity credential** and signs nothing:

- **Renders through L0176.** L0176 signs the activity at view time through Graffiticode's Broker (whose signatures are bound to L0176's host) and renders it in its own form; once the cutover is active the api sends L0158 items to L0176's form.
- **Saves through L0176.** L0158 never writes to the item bank: `save-to-itembank true` and `set-var "learnosity-key"` / `"learnosity-secret"` are compile errors.
- **Has no Author.** `author`, and `init` of an Author activity, are compile errors pointing to L0177.

## Project Structure

npm workspaces monorepo with two packages:

- **packages/api** — Express server (port 50158). Contains the compiler, routes, and serves the built frontend.
- **packages/app** — Published npm package (`@graffiticode/l0158`). Exports `Form` and `View` React components. Built as a Vite library with Tailwind CSS.

## Build & Run Commands

```bash
npm run build                         # Build app, then api, then static (lexicon, spec, instructions, language-info)
npm run dev                           # Dev server with Firestore emulator + local auth
npm start                             # Production start

# Testing (Jest + supertest, tests colocated in packages/api/src/**/*.spec.js)
# NOTE: from the repo root `npx jest` finds NOTHING — the root jest config
# (package.json) ignores packages/. Run the suite from inside packages/api:
cd packages/api && npx jest         # Run all api tests
npx jest packages/api/src/auth.spec.js  # Single file works from root (explicit path overrides the ignore)

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
- **Transformer** — transforms AST nodes into the render-ready activity

**AST node types:** `INIT`, `ITEMS`, `QUESTIONS`, `AUTHOR` (a compile error), `LEARNOSITY` (a pass-through), `HELLO`, `PROG`

**Builders** (plain functions, no credentials or network):
- `createItems` — from `items.js`
- `createQuestions`, `getDynamicContentData` — from `questions.js`
- `normalizeActivity`, `toInlineQuestion`, the preview rules and the removed-feature error messages — from `activity.js`

The lexicon (`src/lexicon.js`) defines language keywords: `init`, `learnosity`, `items`, `questions`, `author`, `hello`. It is generated via `tools/build-lexicon.js` which merges basis lexicon with lang-specific entries. `author` and `save-to-itembank` stay in the lexicon so stored programs that use them still parse and get a compile error rather than a parse error.

### The activity contract

`items` and standalone `questions` both compile to exactly:

```
{ type: "questions",
  data: { id, name, questions: [{ response_id, type, ...questionData }], session_id, dynamic_content_data? } }
```

No `request`, no `itemBank`, and no `data` field outside Broker's `validatePreview` `PREVIEW_KEYS` (`id`, `name`, `questions`, `session_id`, `dynamic_content_data`, `type`); every question has a string `type` and a `response_id` matching `/^[A-Za-z0-9_.:-]{1,250}$/` (generated ids are sanitized to fit). The rules are copied from graffiticode `packages/broker/src/operations.ts`, in `src/activity.js` and, for tests, `src/testing/validate-preview.js`. Compile-time dynamic-data handling stays: `{{X}}` is rewritten to `{{var:X}}` (`fixVariableRefs`) and `dynamic_content_data` is built from an embedded custom question's `templateVariablesRecords` or, failing that, the item's `params`. The View that renders it (L0176's) picks a row and resolves per view, then signs.

`init <activity>` returns a `questions` or `items` activity unsigned and normalized to the same shape (legacy `{ type, reference, data }` question records converted, an old `request` dropped); anything else is a compile error.

### Control-flow attributes (set `options` via side effect)

A few arity-2 keywords don't emit fields into the output record — they mutate the Transformer's `options` so downstream transformers can read them. Template: the `ID` override at the bottom of `compiler.js`.

- `id` — sets `options["lrn-id"]`, required by ITEMS/QUESTIONS (they error if unset).
- `save-to-itembank` — removed. `true` is a compile error ("Error: L0158 no longer saves to the item bank; use L0176."); `false` is a no-op.

`set-var "learnosity-key"` / `"learnosity-secret"` (which basis writes into `options`) are checked in `PROG` and are a compile error whatever else the program does.

### Rendering

Rendering is through Questions API with inline question data (`type: "questions"`): Items API can't render unpublished items, and L0158 uses no item-level features (shared stimulus, layout templates, passages). L0176 signs and renders. Item-level `metadata` (tags, notes, description, source, difficulty-level, acknowledgements) described the bank record L0158 used to save; it is accepted but no longer emitted. Question-level metadata stays on each question.

## API Routes

- `GET /` — health check, returns "OK"
- `POST /compile` — accepts `{ item: {...} }` or array, runs through compiler, returns result
- `GET /form` — serves the SPA (index.html from built app)
- Static assets served from `dist/` and `public/`

## App Components

- **Form** (`lib/components/form/Form.tsx`) — renders Learnosity assessments by dynamically loading Learnosity scripts based on type (items/questions) and calling the appropriate Learnosity JS API
- **View** (`lib/view.jsx`) — SPA shell that reads URL params (id, access_token, origin, data), fetches the compiled item with SWR, and communicates with parent iframe via `postMessage`. It no longer asks for a signature (L0158 can't sign): an L0158 item opened here, before the api sends it to L0176's form, shows "Preview unavailable".
- **State** (`lib/lib/state.js`) — simple reducer-based state management
- **API client** (`lib/lib/api.js`) — HTTP utilities for compile and data endpoints

### Form mount points and signed-request shapes

With no signed `request` in its state the Form shows "Preview unavailable" and never loads the Learnosity SDK or calls `LearnosityApp.init`. Given one (e.g. through `?data=`), each Learnosity API expects a different mount and a differently-shaped signed request — Form.tsx branches on `state.data.type`:

| type | script | signed-request shape | DOM mount |
| :--- | :----- | :-------------------- | :-------- |
| `items` | items.learnosity.com | `{ security, request }` (nested) | `<span id="learnosity_assess" class="learnosity-item" data-reference="item-1">` |
| `questions` | questions.learnosity.com | flat — security fields and `questions[]` at top level | `<span class="learnosity-response question-<response_id>">` per question |

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
- `FIRESTORE_EMULATOR_HOST` — Set for local dev (`127.0.0.1:8080`)
- `PORT` — Server port (default: `50158`)

## Deployment

Google Cloud Run via Cloud Build (`cloudbuild.yaml`). The service mounts no secret and reads no Learnosity credential: every deploy removes `LEARNOSITY_KEY` (`--remove-env-vars`), `LEARNOSITY_SECRET` and the retired `GRAFFITICODE_SECRET_KEY` (`--remove-secrets`), since Cloud Run otherwise carries them over from the previous revision. Deploy commands in root `package.json`: `gcp:build`, `gcp:deploy`, `gcp:logs`.
