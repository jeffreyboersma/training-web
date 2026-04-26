import { useEffect, useState } from 'react';

import type { TrainingPlanPayload } from '../../../types/training-plan';
import { useAuthSession } from '../../auth/hooks/useAuthSession';
import { getMyPlan } from '../api/getMyPlan';

type TrainingPlanState = {
  data: TrainingPlanPayload | null;
  error: string | null;
  loading: boolean;
};

export function useTrainingPlan() {
  const { configured, session } = useAuthSession();
  const [requestVersion, setRequestVersion] = useState(0);
  const [state, setState] = useState<TrainingPlanState>({
    data: null,
    error: null,
    loading: false,
  });

  useEffect(() => {
    if (!configured) {
      return;
    }

    if (!session) {
      return;
    }

    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) {
        setState((current) => ({ ...current, loading: true, error: null }));
      }
    });

    void getMyPlan(session)
      .then((data) => {
        if (cancelled) {
          return;
        }

        setState({ data, error: null, loading: false });
      })
      .catch((caughtError) => {
        if (cancelled) {
          return;
        }

        setState({
          data: null,
          error: caughtError instanceof Error ? caughtError.message : 'We couldn\'t load your plan right now.',
          loading: false,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [configured, requestVersion, session]);

  return {
    data: configured && session ? state.data : null,
    error: !configured ? 'Sign-in is not available right now.' : session ? state.error : null,
    loading: configured && Boolean(session) ? state.loading : false,
    refresh: () => setRequestVersion((current) => current + 1),
  };
}

