# local setup

## Prerequisites

- Node.js compatible with the current Vite and React toolchain
- npm
- A Supabase project with public browser auth enabled
- The private backend from the sibling backend repo deployed or available in a linked environment

## Environment variables

Copy `.env.example` and provide only public-safe values:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_EDGE_FUNCTION_URL` when edge functions are served from a custom base
- `VITE_APP_BASE_PATH`

For local development, `VITE_APP_BASE_PATH=/` is usually the correct value.

## Start the app

```bash
npm install
npm run dev
```

## Validation

```bash
npm run lint
npm run typecheck
npm run test:run
npm run build
```

## Backend expectations while developing

- Supabase auth must be configured for the local frontend origin
- `get-my-plan` must be deployed and reachable from the configured browser environment
- the backend payload must match the contract rendered in `src/types/training-plan.ts`
- the logged-in athlete must already have an assigned published plan version