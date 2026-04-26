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
          eyebrow="Authorizing"
          message="The app is verifying whether an authenticated athlete session already exists."
          title="Checking your session"
        />
      </main>
    );
  }

  if (!session) {
    return <Navigate replace to="/login" />;
  }

  return <>{children}</>;
}
