import { afterEach, describe, expect, it, vi } from 'vitest';

import { getMyPlan } from './getMyPlan';

const session = {
  access_token: 'test-access-token',
} as never;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getMyPlan', () => {
  it('returns null when the backend reports no active assignment', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: 'No active plan assignment found.' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 404,
        }),
      ),
    );

    await expect(getMyPlan(session)).resolves.toBeNull();
  });

  it('throws a parsed backend error for non-empty failures', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: 'Origin not allowed.' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 403,
        }),
      ),
    );

    await expect(getMyPlan(session)).rejects.toThrow('Origin not allowed.');
  });
});
