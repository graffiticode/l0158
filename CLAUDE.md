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
