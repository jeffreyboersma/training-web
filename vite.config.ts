import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

function normalizeBasePath(value: string | undefined): string {
  if (!value || value.trim() === '' || value.trim() === '/') {
    return '/';
  }

  const trimmed = value.trim();
  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: normalizeBasePath(env.VITE_APP_BASE_PATH),
    plugins: [react()],
    test: {
      environment: 'node',
    },
  };
});
