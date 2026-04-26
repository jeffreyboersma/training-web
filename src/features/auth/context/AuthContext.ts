import type { Session } from '@supabase/supabase-js';
import { createContext } from 'react';

export type AuthContextValue = {
  configured: boolean;
  loading: boolean;
  session: Session | null;
  signInWithOtp: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
