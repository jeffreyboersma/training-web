import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { trainingPlanPayloadSchema } from './training-plan';

describe('backend contract parity', () => {
  it('accepts the backend sample payload when the sibling backend repo is available', async () => {
    const backendFixturePath = path.resolve(process.cwd(), '../training-backend/tests/fixtures/sample-plan-payload.json');

    try {
      await access(backendFixturePath);
    } catch {
      expect(true).toBe(true);
      return;
    }

    const payload = JSON.parse(await readFile(backendFixturePath, 'utf8')) as unknown;
    const parsed = trainingPlanPayloadSchema.parse(payload);

    expect(parsed.weeklyPlans.length).toBeGreaterThan(0);
  });
});