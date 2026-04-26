# training-web architecture

## Purpose

This repo serves the public web client for athletes. It is intentionally thin: authenticate, fetch the authenticated athlete's plan, validate the response contract, and render the training experience.

## Repo Responsibilities

- Browser authentication flows
- Session-aware routing and protected pages
- Runtime fetch of the current athlete plan
- Rendering of the existing training plan domain model
- Static asset deployment to GitHub Pages

## Preserved Payload Contract

The reference app currently derives its UI from a normalized payload equivalent to these keys:

- `plan`
- `actionItems`
- `zones`
- `phases`
- `strengthApproach`
- `weeklyPlans`
- `raceStrategy`
- `legend`

The secure frontend will continue to render against that shape as closely as practical. The main change is transport: the payload comes from the backend after authentication instead of from a checked-in JavaScript file.

## Runtime Data Flow

1. Athlete opens the GitHub Pages app.
2. The browser initializes the Supabase client using public environment variables.
3. The athlete signs in with Supabase Auth.
4. The app obtains an authenticated session and guards protected routes.
5. The app calls the backend edge function `get-my-plan` with the session access token.
6. The response is validated with a frontend schema before rendering.
7. UI components render plan metadata, events, phases, weeks, and sessions without embedding private data in the repo.

## Auth Flow

- Primary v1 path: email-based sign-in through Supabase Auth
- Browser stores only the session managed by Supabase client libraries
- Unauthenticated users can see only the login screen and public shell
- Authenticated users can request only their own plan payload

## Deployment Model

- Build with Vite into static assets
- Deploy to GitHub Pages from this public repo
- Configure only public-safe environment variables in GitHub Actions or Pages settings:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_SUPABASE_EDGE_FUNCTION_URL` if a non-default function base is required
  - `VITE_APP_BASE_PATH` for repository-specific Pages paths

## Security Model

- No plan JSON is checked into this repo
- No backend SQL or service-role secrets are stored here
- The anon key is acceptable in a public frontend because authorization is enforced server-side by Supabase Auth and backend policies
- The frontend does not query privileged tables directly; it uses an authenticated backend boundary

## Tradeoffs

- GitHub Pages keeps hosting cost low and operationally simple, but requires a fully static frontend build
- Supabase Auth plus an authenticated edge function keeps the browser simple and avoids exposing private backend logic
- Preserving the legacy payload shape reduces migration risk and keeps rendering work incremental