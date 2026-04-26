import { Outlet } from 'react-router-dom';

export function App() {
  return (
    <div className="app-frame">
      <header className="site-header">
        <div>
          <p className="site-kicker">Endurance Platform</p>
          <h1 className="site-title">Training App</h1>
        </div>
        <p className="site-summary">
          Secure athlete plans delivered at runtime from Supabase, without embedding plan data in the public frontend.
        </p>
      </header>
      <Outlet />
    </div>
  );
}
