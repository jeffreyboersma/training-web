import type { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';

import { StatePanel } from '../../../app/components/StatePanel';
import { useAuthSession } from '../hooks/useAuthSession';

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { configured, loading, session } = useAuthSession();

  if (!configured) {
    return <Navigate replace to="/login?reason=missing-config" />;
  }

  if (loading) {
    return (
      <main className="page-shell">
        <StatePanel
          eyebrow="Signing you in"
          message="Checking whether you already have an active session."
          title="Restoring your access"
        />
      </main>
    );
  }

  if (!session) {
    return <Navigate replace to="/login" />;
  }

  return <>{children}</>;
}
