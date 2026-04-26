import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildAppPath, buildAppUrl, normalizeAppOrigin, normalizeBasePath } from './env';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('app URL helpers', () => {
  it('normalizes empty and nested base paths', () => {
    expect(normalizeBasePath(undefined)).toBe('/');
    expect(normalizeBasePath('/')).toBe('/');
    expect(normalizeBasePath('training-web')).toBe('/training-web/');
  });

  it('normalizes an optional app origin override', () => {
    expect(normalizeAppOrigin(undefined)).toBeUndefined();
    expect(normalizeAppOrigin(' https://training.jeffreyboersma.com/ ')).toBe(
      'https://training.jeffreyboersma.com',
    );
  });

  it('builds app paths for local development and Pages project sites', () => {
    expect(buildAppPath('/', 'app')).toBe('/app');
    expect(buildAppPath('/training-web/', 'app')).toBe('/training-web/app');
  });

  it('builds full redirect URLs for localhost and GitHub Pages', () => {
    expect(buildAppUrl('http://localhost:5173', '/', 'app')).toBe('http://localhost:5173/app');
    expect(buildAppUrl('https://owner.github.io', '/training-web/', 'app')).toBe(
      'https://owner.github.io/training-web/app',
    );
  });

  it('prefers the configured public app origin for callback URLs', async () => {
    vi.stubEnv('VITE_APP_BASE_PATH', '/');
    vi.stubEnv('VITE_APP_ORIGIN', 'https://training.jeffreyboersma.com/');

    const { appEnv, buildAppUrl, getAppOrigin } = await import('./env');

    expect(buildAppUrl(getAppOrigin('http://127.0.0.1:5173'), appEnv.appBasePath, 'app')).toBe(
      'https://training.jeffreyboersma.com/app',
    );
  });
});
