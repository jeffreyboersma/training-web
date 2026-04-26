# deployment

## GitHub Pages

This repo is designed to deploy as static assets on GitHub Pages.

## Required Repository Variables

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_EDGE_FUNCTION_URL` if edge functions are served from a custom domain

## Base Path

The deploy workflow sets `VITE_APP_BASE_PATH` to `/<repo-name>/` so React Router and Vite assets work correctly on GitHub Pages project sites.

## Notes

- The frontend should never receive service-role credentials
- The Supabase anon key is expected to be public-safe
- Private plan data must remain in the backend and be fetched only after authentication
