import { Outlet } from 'react-router-dom';

export function App() {
  return (
    <div className="app-frame">
      <header className="site-header">
        <div className="site-brand">
          <p className="site-kicker">Athlete workspace</p>
          <h1 className="site-title">Training App</h1>
        </div>
        <div className="site-header-copy">
          <p className="site-summary">
            Secure athlete plans delivered at runtime from Supabase, without embedding private plan data in the public frontend.
          </p>
          <p className="site-badge">GitHub Pages static client • Supabase-authenticated plan delivery</p>
        </div>
      </header>
      <Outlet />
      <footer className="site-footer">
        <p>Public-safe client only. Authenticated plan data stays behind the backend boundary.</p>
      </footer>
    </div>
  );
}
