'use client';

import { createContext, use, useEffect, useState } from 'react';
import { supabase } from '@/libs/supabase';

type AuthContextValue = {
  isAuthenticated: boolean;
  isPremium: boolean;
  token: string | null;
};

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  isPremium: false,
  token: null,
});

export const AuthProvider = (props: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // TODO: revert to false
  const [isPremium] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Restore session on mount
    supabase.auth.getSession().then(({ data }) => {
      setIsAuthenticated(!!data.session);
      setToken(data.session?.access_token ?? null);
    });

    // Keep in sync with Supabase auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setToken(session?.access_token ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext value={{ isAuthenticated, isPremium, token }}>
      {props.children}
    </AuthContext>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => use(AuthContext);
