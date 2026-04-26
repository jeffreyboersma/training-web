import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { StatePanel } from '../../../app/components/StatePanel';
import { appEnv } from '../../../lib/config/env';
import { useAuthSession } from '../hooks/useAuthSession';

export function LoginPage() {
  const location = useLocation();
  const { configured, loading, session, signInWithOtp } = useAuthSession();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (session) {
    return <Navigate replace to="/app" />;
  }

  if (configured && loading) {
    return (
      <main className="page-shell auth-page">
        <StatePanel
          eyebrow="Authorizing"
          message="The app is completing your sign-in flow and restoring any existing athlete session."
          title="Checking secure access"
        />
      </main>
    );
  }

  const missingConfig = new URLSearchParams(location.search).get('reason') === 'missing-config';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setStatus(null);

    try {
      await signInWithOtp(email.trim());
      setStatus('Check your email for the secure sign-in link.');
      setEmail('');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to send sign-in link.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-shell auth-page">
      <div className="auth-layout">
        <section className="panel-card auth-card">
          <p className="eyebrow">Secure athlete access</p>
          <h2>Sign in to load your live training plan</h2>
          <p className="muted-copy">
            This public client never embeds plan data. After login, it requests only your assigned plan from the authenticated
            backend boundary.
          </p>

          {!configured ? (
            <div className="notice-card notice-error">
              <strong>Frontend configuration is incomplete.</strong>
              <p>Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before testing authentication.</p>
            </div>
          ) : null}

          {missingConfig && configured ? (
            <div className="notice-card">
              <strong>Authentication is required.</strong>
              <p>Sign in first so the app can request only your plan from the backend.</p>
            </div>
          ) : null}

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="field-label" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              className="text-input"
              type="email"
              autoComplete="email"
              placeholder="athlete@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={!configured || submitting}
              required
            />
            <p className="field-help">The magic link returns to this GitHub Pages app and restores your athlete session in the browser.</p>
            <button className="primary-button" type="submit" disabled={!configured || submitting}>
              {submitting ? 'Sending secure link...' : 'Send magic link'}
            </button>
          </form>

          {status ? <p className="status-copy success-copy">{status}</p> : null}
          {error ? <p className="status-copy error-copy">{error}</p> : null}
        </section>

        <aside className="panel-card auth-sidecar">
          <div className="section-heading">
            <p className="eyebrow">What happens next</p>
            <h3>Pages-safe, backend-authenticated flow</h3>
          </div>
          <div className="stack-grid">
            <article className="mini-panel">
              <strong>1. Email link</strong>
              <p>Supabase sends a one-time sign-in link to the athlete email address you enter.</p>
            </article>
            <article className="mini-panel">
              <strong>2. Static-host callback</strong>
              <p>GitHub Pages serves the app shell, then restores the requested route so auth redirects survive project-site hosting.</p>
            </article>
            <article className="mini-panel">
              <strong>3. Secure plan fetch</strong>
              <p>The app uses the session access token to call the backend `get-my-plan` function at runtime.</p>
            </article>
          </div>

          <div className="notice-card auth-redirect-card">
            <strong>Expected post-login route</strong>
            <p>{appEnv.appBasePath === '/' ? '/app' : `${appEnv.appBasePath}app`}</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
