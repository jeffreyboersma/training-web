import { useEffect, useRef, useState } from 'react';

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
  const sessionRef = useRef(session);
  const [state, setState] = useState<TrainingPlanState>({
    data: null,
    error: null,
    loading: false,
  });
  const sessionUserId = session?.user.id ?? null;

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    if (!configured) {
      return;
    }

    const activeSession = sessionRef.current;

    if (!sessionUserId || !activeSession) {
      return;
    }

    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) {
        setState((current) => ({ ...current, loading: true, error: null }));
      }
    });

    void getMyPlan(activeSession)
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
  }, [configured, requestVersion, sessionUserId]);

  return {
    data: configured && session ? state.data : null,
    error: !configured ? 'Sign-in is not available right now.' : session ? state.error : null,
    loading: configured && Boolean(session) ? state.loading : false,
    refresh: () => setRequestVersion((current) => current + 1),
  };
}

