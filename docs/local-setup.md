# local setup

## Prerequisites

- Node.js compatible with the current Vite and React toolchain
- npm
- A Supabase project with public browser auth enabled
- The private backend from the sibling backend repo deployed or available in a linked environment

## Environment variables

Create `.env.local` from `.env.example` and provide only public-safe values:

```bash
cp .env.example .env.local
```

Required values for local auth:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_EDGE_FUNCTION_URL` when edge functions are served from a custom base
- `VITE_APP_BASE_PATH`

Optional value:

- `VITE_APP_ORIGIN` when you need auth emails to return to a canonical public origin instead of the current browser origin

Where to get them in Supabase:

- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anon public key

These are available in the Supabase dashboard under `Project Settings` -> `API`.

For local development, `VITE_APP_BASE_PATH=/` is usually the correct value.

Example local file:

```dotenv
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_BASE_PATH=/
```

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
npm run verify:pages-fallback
```

## Backend expectations while developing

- Supabase auth must be configured for the local frontend origin
- if you use a deployed Supabase project, `supabase/config.toml` should be pushed so the hosted auth redirect allowlist matches the frontend callback URLs
- `get-my-plan` must be deployed and reachable from the configured browser environment
- the backend payload must match the contract rendered in `src/types/training-plan.ts`
- the logged-in athlete must already have an assigned published plan version

## Redirect and no-plan checks

- Supabase must allow `http://localhost:5173/app` as a redirect URL for local magic-link testing
- If the backend returns `No active plan assignment found.`, the app should show the athlete empty state instead of an error panel
- `npm run verify:pages-fallback` verifies the static Pages fallback artifacts, but the deployed Pages URL still needs a real auth smoke test