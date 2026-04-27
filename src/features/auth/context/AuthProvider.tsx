import type { PropsWithChildren } from 'react';
import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import { AuthContext } from './AuthContext';
import { toAppUrl } from '../../../lib/config/env';
import { getSupabaseBrowserClient } from '../../../lib/supabase/client';

export function AuthProvider({ children }: PropsWithChildren) {
  const supabase = getSupabaseBrowserClient();
  const configured = Boolean(supabase);
  const [loading, setLoading] = useState(configured);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!supabase) {
      return undefined;
    }

    let disposed = false;

    void supabase.auth.getSession().then(({ data, error }) => {
      if (disposed || error) {
        setLoading(false);
        return;
      }

      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      disposed = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function signInWithOtp(email: string) {
    if (!supabase) {
      throw new Error('Sign-in is not available right now.');
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: toAppUrl('app'),
      },
    });

    if (error) {
      throw error;
    }
  }

  async function signOut() {
    if (!supabase) {
      return;
    }

    setSession(null);
    setLoading(false);

    const { error } = await supabase.auth.signOut({ scope: 'local' });

    if (error) {
      throw error;
    }
  }

  return (
    <AuthContext.Provider value={{ configured, loading, session, signInWithOtp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
