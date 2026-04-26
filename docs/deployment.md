# deployment

## GitHub Pages

This repo is designed to deploy as static assets on GitHub Pages.
The current production URL is `https://training.jeffreyboersma.com/`.

## Router and deep-link behavior

The app uses a browser-router strategy plus static SPA fallback files.

- `index.html` restores any rewritten route before React boots
- `public/404.html` rewrites deep-link requests back to the app shell
- This is required for project-site hosting because direct requests like `/repo-name/app` are otherwise served as 404s by GitHub Pages
- `npm run verify:pages-fallback` validates the built `dist/index.html` and `dist/404.html` artifacts against deep links, query strings, and auth-fragment callbacks

The same fallback also protects Supabase auth redirects that land directly on protected routes.

## Required Repository Variables

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_EDGE_FUNCTION_URL` if edge functions are served from a custom domain
- `VITE_APP_BASE_PATH` only when production is not served from the custom-domain root
- `VITE_APP_ORIGIN` only when the canonical public origin is not `https://training.jeffreyboersma.com`

The GitHub Pages workflow reads the public-safe Supabase values from GitHub repository variables and fails fast if the required values are missing.
If `VITE_APP_BASE_PATH` is not provided, the workflow defaults it to `/` so the build matches the current production custom-domain root.
If `VITE_APP_ORIGIN` is not provided, the workflow defaults it to `https://training.jeffreyboersma.com` so auth callbacks point at the public site instead of whichever host initiated the sign-in request.
If deployment moves away from the current custom domain, override both variables in the repository settings.

## Base Path

The deploy workflow defaults `VITE_APP_BASE_PATH` to `/` so React Router and Vite assets match the current custom-domain root deployment.
Override it when publishing the app at a non-root path.

## Supabase redirect URLs

The Supabase project must allow the exact frontend origins and callback locations used by the athlete app.

Recommended redirect URLs:

- local development: `http://localhost:5173/app`
- production custom domain: `https://training.jeffreyboersma.com/app`

Because the Pages SPA fallback restores deep links before React initializes, redirecting to `/app` remains safe on GitHub Pages.
The frontend build can now pin auth callbacks to a canonical public origin so cross-device email sign-in does not fall back to a loopback host such as `127.0.0.1`.

Session restoration expectations:

- local development resolves magic links to `http://localhost:5173/app`
- production resolves magic links to `https://training.jeffreyboersma.com/app`
- when the callback lands directly on `/app` with an auth fragment, the route remains intact and Supabase session detection runs after the app shell loads

## Backend integration assumptions

This frontend assumes all of the following remain true:

- `get-my-plan` accepts a bearer token from the browser session
- `get-my-plan` returns the backend-owned rendered payload contract
- the backend continues to validate authorization server-side
- edge-function CORS allows the Pages origin and local dev origin
- no service-role credential is ever required in browser code

The frontend now explicitly treats the backend `No active plan assignment found.` response as the intended athlete empty state instead of a generic error panel.

## Notes

- The frontend should never receive service-role credentials
- The Supabase anon key is expected to be public-safe
- Private plan data must remain in the backend and be fetched only after authentication

If the GitHub Pages site URL changes, update the Pages base path, the allowed Supabase redirect URLs, and the backend CORS allowlist together.

