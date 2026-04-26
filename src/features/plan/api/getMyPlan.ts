import type { Session } from '@supabase/supabase-js';

import { getEdgeFunctionUrl } from '../../../lib/config/env';
import { trainingPlanPayloadSchema, type TrainingPlanPayload } from '../../../types/training-plan';

export async function getMyPlan(session: Session): Promise<TrainingPlanPayload | null> {
  const response = await fetch(getEdgeFunctionUrl('get-my-plan'), {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const message = await readErrorMessage(response);

    if (response.status === 404 && message === 'No active plan assignment found.') {
      return null;
    }

    throw new Error(message || 'Unable to fetch the current athlete plan.');
  }

  const payload = await response.json();

  return trainingPlanPayloadSchema.parse(payload);
}

async function readErrorMessage(response: Response) {
  const body = await response.text();

  if (!body) {
    return null;
  }

  try {
    const parsed = JSON.parse(body) as { error?: unknown };

    if (typeof parsed.error === 'string' && parsed.error.trim()) {
      return parsed.error;
    }
  } catch {
    return body;
  }

  return body;
}
