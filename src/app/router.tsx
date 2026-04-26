import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { App } from './App';
import { StatePanel } from './components/StatePanel';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';
import { appEnv } from '../lib/config/env';

const LoginPage = lazy(() => import('../features/auth/pages/LoginPage').then((module) => ({ default: module.LoginPage })));
const PlanPage = lazy(() => import('../features/plan/pages/PlanPage').then((module) => ({ default: module.PlanPage })));

function RouteLoadingState({ message, title }: { message: string; title: string }) {
  return (
    <main className="page-shell">
      <StatePanel eyebrow="Loading" message={message} title={title} />
    </main>
  );
}

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <App />,
      children: [
        {
          index: true,
          element: <Navigate replace to="/app" />,
        },
        {
          path: 'login',
          element: (
            <Suspense
              fallback={
                <RouteLoadingState
                  title="Loading sign-in"
                  message="Preparing the secure sign-in flow and static route shell."
                />
              }
            >
              <LoginPage />
            </Suspense>
          ),
        },
        {
          path: 'app',
          element: (
            <ProtectedRoute>
              <Suspense
                fallback={
                  <RouteLoadingState
                    title="Loading training plan"
                    message="Preparing the authenticated athlete workspace."
                  />
                }
              >
                <PlanPage />
              </Suspense>
            </ProtectedRoute>
          ),
        },
      ],
    },
  ],
  {
    basename: appEnv.appBasePath === '/' ? undefined : appEnv.appBasePath,
  },
);
