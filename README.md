# training-web

Public React frontend for the multi-user training application.

This repo is responsible for authentication UX, the athlete-facing application shell, and runtime plan rendering. It does not contain user data, plan data, secrets, or private backend logic.

## Responsibilities

- Render the authenticated athlete experience in the browser
- Authenticate users with Supabase Auth
- Fetch the authenticated athlete's plan from the backend at runtime
- Validate backend responses against the frontend contract before rendering
- Build static assets suitable for GitHub Pages deployment

## Architecture

The frontend preserves the existing training plan rendering contract from the reference app. Instead of loading plan constants from a checked-in `training-data.js`, it fetches a payload with the same practical shape from a private Supabase backend after login.

- Hosting: GitHub Pages
- App stack: React, TypeScript, Vite
- Auth client: `@supabase/supabase-js`
- Routing: `react-router-dom` with a GitHub Pages SPA fallback for deep links and auth redirects
- Runtime contract validation: `zod`

See [docs/architecture.md](docs/architecture.md) for the full design.
See [docs/local-setup.md](docs/local-setup.md) for local setup and env configuration.
See [docs/deployment.md](docs/deployment.md) for Pages deployment and redirect guidance.

## Security Boundaries

- Safe to expose in this public repo: Supabase project URL, Supabase anon key, static frontend source
- Never expose here: service role keys, raw athlete data exports, seeded production plans, backend SQL, private business logic
- All plan data is fetched on demand for the authenticated user

## Planned Repo Structure

```text
src/
	app/               App shell, routing, providers
	features/
		auth/            Login, session guards, auth hooks
		plan/            Plan queries, presentation, payload adapters
	lib/
		config/          Environment loading and guards
		supabase/        Browser client setup
	types/             Frontend contract types and schemas
docs/                Architecture and deployment documentation
.github/workflows/  CI and GitHub Pages deployment
```

## Development

Install dependencies and run the app:

```bash
npm install
npm run dev
```

Primary validation commands:

```bash
npm run lint
npm run typecheck
npm run test:run
npm run build
```

The app expects only public-safe environment variables. Use [.env.example](.env.example) as the template.

## Validation

The app includes linting, formatting, type-checking, unit tests, and a production build suitable for CI and GitHub Pages deployment.
