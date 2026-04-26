import type { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuthSession } from '../hooks/useAuthSession';

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { configured, loading, session } = useAuthSession();

  if (!configured) {
    return <Navigate replace to="/login?reason=missing-config" />;
  }

  if (loading) {
    return (
      <main className="page-shell">
        <section className="panel-card state-card">
          <p className="eyebrow">Authorizing</p>
          <h2>Checking your session</h2>
          <p className="muted-copy">The app is verifying whether an authenticated athlete session already exists.</p>
        </section>
      </main>
    );
  }

  if (!session) {
    return <Navigate replace to="/login" />;
  }

  return <>{children}</>;
}
