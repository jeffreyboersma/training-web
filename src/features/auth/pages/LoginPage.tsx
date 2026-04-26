import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { appEnv } from '../../../lib/config/env';
import { useAuthSession } from '../hooks/useAuthSession';

export function LoginPage() {
  const location = useLocation();
  const { configured, session, signInWithOtp } = useAuthSession();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (session) {
    return <Navigate replace to="/app" />;
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
      <section className="panel-card auth-card">
        <p className="eyebrow">Secure athlete access</p>
        <h2>Sign in to view your plan</h2>
        <p className="muted-copy">
          This public frontend never ships plan data. After login, the app fetches your assigned training plan from the private
          backend.
        </p>

        {!configured ? (
          <div className="notice-card notice-error">
            <strong>Frontend configuration is incomplete.</strong>
            <p>
              Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> before testing authentication.
            </p>
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
          <button className="primary-button" type="submit" disabled={!configured || submitting}>
            {submitting ? 'Sending link...' : 'Send magic link'}
          </button>
        </form>

        {status ? <p className="status-copy success-copy">{status}</p> : null}
        {error ? <p className="status-copy error-copy">{error}</p> : null}

        <div className="panel-subgrid">
          <article className="mini-panel">
            <h3>GitHub Pages friendly</h3>
            <p>Static assets deploy publicly while user-specific data remains in Supabase.</p>
          </article>
          <article className="mini-panel">
            <h3>Expected redirect</h3>
            <p>{appEnv.appBasePath === '/' ? '/app' : `${appEnv.appBasePath}app`}</p>
          </article>
        </div>
      </section>
    </main>
  );
}
