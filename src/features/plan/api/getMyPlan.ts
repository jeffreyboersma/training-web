import type { Session } from '@supabase/supabase-js';

import { getEdgeFunctionUrl } from '../../../lib/config/env';
import { trainingPlanPayloadSchema, type TrainingPlanPayload } from '../../../types/training-plan';

export async function getMyPlan(session: Session): Promise<TrainingPlanPayload> {
  const response = await fetch(getEdgeFunctionUrl('get-my-plan'), {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Unable to fetch the current athlete plan.');
  }

  const payload = await response.json();

  return trainingPlanPayloadSchema.parse(payload);
}
