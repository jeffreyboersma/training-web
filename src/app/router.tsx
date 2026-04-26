import { createBrowserRouter, Navigate } from 'react-router-dom';

import { App } from './App';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';
import { PlanPage } from '../features/plan/pages/PlanPage';
import { appEnv } from '../lib/config/env';

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
          element: <LoginPage />,
        },
        {
          path: 'app',
          element: (
            <ProtectedRoute>
              <PlanPage />
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
