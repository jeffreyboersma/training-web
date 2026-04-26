import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { StatePanel } from '../../../app/components/StatePanel';
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
          eyebrow="Signing you in"
          message="Restoring your access and preparing your training view."
          title="Checking your session"
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
      setStatus('Check your email for your sign-in link.');
      setEmail('');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to send your sign-in link.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-shell auth-page">
      <div className="auth-layout">
        <section className="panel-card auth-card">
          <p className="eyebrow">Welcome back</p>
          <h2>Your training, in one focused place</h2>
          <p className="muted-copy">Sign in with your email to open your current plan, weekly sessions, and upcoming race targets.</p>

          {!configured ? (
            <div className="notice-card notice-error">
              <strong>Sign-in is not available right now.</strong>
              <p>Finish the app sign-in setup, then try again.</p>
            </div>
          ) : null}

          {missingConfig && configured ? (
            <div className="notice-card">
              <strong>Sign in to continue.</strong>
              <p>Your plan becomes available as soon as your session is active.</p>
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
            <p className="field-help">We&apos;ll send a one-time link that brings you straight back into your training dashboard.</p>
            <button className="primary-button" type="submit" disabled={!configured || submitting}>
              {submitting ? 'Sending link...' : 'Email me a sign-in link'}
            </button>
          </form>

          {status ? <p className="status-copy success-copy">{status}</p> : null}
          {error ? <p className="status-copy error-copy">{error}</p> : null}
        </section>

        <aside className="panel-card auth-sidecar">
          <div className="section-heading">
            <p className="eyebrow">What you get</p>
            <h3>A cleaner training ritual</h3>
          </div>
          <div className="stack-grid">
            <article className="mini-panel">
              <strong>Your week at a glance</strong>
              <p>See the current block, your key sessions, and what is coming up next without digging through notes.</p>
            </article>
            <article className="mini-panel">
              <strong>Session detail when you need it</strong>
              <p>Open any workout for duration, intensity, purpose, and coaching notes in a distraction-free view.</p>
            </article>
            <article className="mini-panel">
              <strong>Clear focus around key events</strong>
              <p>Track upcoming races, recovery weeks, and phase changes with distinct visual cues that stay easy to scan.</p>
            </article>
          </div>

          <div className="notice-card auth-redirect-card">
            <strong>Private by default</strong>
            <p>Your plan appears only after you sign in with your email link.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
