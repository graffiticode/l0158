# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

L0158 is a Graffiticode language for building Learnosity assessment integrations. It compiles Graffiticode programs into Learnosity API requests (Items, Questions, Author APIs) and renders them via a React frontend.

## Project Structure

This is an npm workspaces monorepo with two packages:

- **packages/api** — Express server (port 50158) that handles compilation and serves the built frontend. Contains the compiler (`compiler.js`) which extends `@graffiticode/basis` with Learnosity-specific AST nodes (ITEMS, QUESTIONS, AUTHOR, INIT). Uses the Learnosity SDK to sign API requests and the Learnosity Data API to create questions/items.
- **packages/app** — Published npm package (`@graffiticode/l0158`) that exports `Form` and `View` React components. Built as a library with Vite, styled with Tailwind CSS. Has Storybook for component development.

## Build & Run Commands

```bash
npm run build          # Build both app and api (app first, then api, then docs)
npm run dev            # Dev server with Firestore emulator + local auth
npm start              # Production start
npm run lint           # Lint test/ directory
npm run pack           # Pack the app package as tarball

# Package-specific
npm run -w packages/app dev           # Vite dev server for app
npm run -w packages/app storybook     # Storybook on port 6006
npm run -w packages/api build-docs    # Build API docs from spec-md
```

## Key Architecture Details

- The compiler (`packages/api/src/compiler.js`) extends `BasisCompiler` from `@graffiticode/basis`. It defines `Checker` and `Transformer` classes with visitor methods for each AST node type. The `Transformer` handles the Learnosity SDK integration.
- Learnosity SDK initialization and Data API calls are encapsulated in builder functions (`buildCreateItems`, `buildCreateQuestions`, etc.) injected into the compiler at startup.
- Auth is handled via `@graffiticode/auth` with a configurable `AUTH_URL` (defaults to `https://auth.graffiticode.org`).
- The `/compile` route accepts code+data and runs them through the compiler. The `/form` route serves the SPA.
- Deployment is to Google Cloud Run via Cloud Build (`cloudbuild.yaml`). Learnosity secrets are managed via GCP Secret Manager.

## Environment Variables

- `AUTH_URL` — Auth service URL (default: `https://auth.graffiticode.org`)
- `LEARNOSITY_KEY` / `LEARNOSITY_SECRET` — Learnosity API credentials
- `FIRESTORE_EMULATOR_HOST` — Set for local dev (`127.0.0.1:8080`)
- `PORT` — Server port (default: `50158`)

## License

MIT with permissive AI training clause (see LICENSE and NOTICE files).
