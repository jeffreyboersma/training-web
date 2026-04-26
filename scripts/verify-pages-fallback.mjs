import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

const distDir = path.resolve(process.cwd(), 'dist');
const expectedBasePath = normalizeBasePath(process.env.VITE_APP_BASE_PATH);

const [indexHtml, fallbackHtml] = await Promise.all([
  readFile(path.join(distDir, 'index.html'), 'utf8'),
  readFile(path.join(distDir, '404.html'), 'utf8'),
]);

const indexScript = extractInlineScript(indexHtml);
const fallbackScript = extractInlineScript(fallbackHtml);

assertAssetBase(indexHtml, expectedBasePath);

assert.equal(roundTripPagesUrl('https://owner.github.io/training-web/app'), 'https://owner.github.io/training-web/app');
assert.equal(
  roundTripPagesUrl('https://owner.github.io/training-web/app?view=calendar'),
  'https://owner.github.io/training-web/app?view=calendar',
);
assert.equal(
  roundTripPagesUrl('https://owner.github.io/training-web/app#access_token=abc&refresh_token=def'),
  'https://owner.github.io/training-web/app#access_token=abc&refresh_token=def',
);
assert.equal(
  roundTripPagesUrl('https://owner.github.io/training-web/app?view=calendar#access_token=abc&refresh_token=def'),
  'https://owner.github.io/training-web/app?view=calendar#access_token=abc&refresh_token=def',
);
assert.equal(
  runIndexRestore('http://localhost:5173/app?view=calendar#access_token=abc'),
  'http://localhost:5173/app?view=calendar#access_token=abc',
);

console.log('Verified built GitHub Pages fallback and route restore behavior.');

function assertAssetBase(html, basePath) {
  const assetMatches = [...html.matchAll(/(?:src|href)="([^"]+assets\/[^"]+)"/g)].map((match) => match[1]);

  assert.ok(assetMatches.length >= 2, 'Expected built HTML to reference JS and CSS assets.');

  if (basePath === '/') {
    return;
  }

  for (const assetPath of assetMatches) {
    assert.ok(
      assetPath.startsWith(basePath),
      `Expected built asset path ${assetPath} to start with configured base path ${basePath}.`,
    );
  }
}

function roundTripPagesUrl(url) {
  const redirectedUrl = runFallbackRewrite(url);

  return runIndexRestore(redirectedUrl);
}

function runFallbackRewrite(url) {
  const location = createLocation(url);
  let redirectedUrl = null;

  location.replace = (nextUrl) => {
    redirectedUrl = nextUrl;
  };

  executeScript(fallbackScript, {
    location,
    window: { location },
  });

  assert.ok(redirectedUrl, `Expected fallback script to rewrite ${url}.`);

  return redirectedUrl;
}

function runIndexRestore(url) {
  const location = createLocation(url);
  let restoredUrl = null;
  const history = {
    replaceState(_state, _title, nextUrl) {
      restoredUrl = new URL(nextUrl, location.origin).toString();
    },
  };

  executeScript(indexScript, {
    history,
    location,
    window: { history, location },
  });

  return restoredUrl ?? url;
}

function executeScript(source, context) {
  vm.runInNewContext(source, context, { timeout: 1_000 });
}

function extractInlineScript(html) {
  const match = html.match(/<script>([\s\S]*?)<\/script>/);

  assert.ok(match?.[1], 'Expected built HTML to include an inline SPA fallback script.');

  return match[1];
}

function createLocation(url) {
  const parsedUrl = new URL(url);

  return {
    hash: parsedUrl.hash,
    hostname: parsedUrl.hostname,
    origin: parsedUrl.origin,
    pathname: parsedUrl.pathname,
    replace() {
      throw new Error('location.replace was not stubbed for this execution path.');
    },
    search: parsedUrl.search,
  };
}

function normalizeBasePath(value) {
  if (!value || value.trim() === '' || value.trim() === '/') {
    return '/';
  }

  const trimmed = value.trim();
  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
}
