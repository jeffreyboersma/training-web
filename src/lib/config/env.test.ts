import { describe, expect, it } from 'vitest';

import { buildAppPath, buildAppUrl, normalizeBasePath } from './env';

describe('app URL helpers', () => {
  it('normalizes empty and nested base paths', () => {
    expect(normalizeBasePath(undefined)).toBe('/');
    expect(normalizeBasePath('/')).toBe('/');
    expect(normalizeBasePath('training-web')).toBe('/training-web/');
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
});
