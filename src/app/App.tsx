import { Outlet } from 'react-router-dom';

export function App() {
  return (
    <div className="app-frame">
      <header className="site-header">
        <div className="site-brand">
          <span className="brand-mark" aria-hidden="true" />
          <div>
            <p className="site-kicker">Personal training</p>
            <h1 className="site-title">Training App</h1>
          </div>
        </div>
        <div className="site-header-copy">
          <p className="site-summary">A calm, focused view of your training block, weekly sessions, and upcoming race goals.</p>
          <p className="site-badge">Built for everyday consistency and race-day clarity</p>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
