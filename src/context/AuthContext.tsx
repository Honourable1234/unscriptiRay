'use client';

import { createContext, use, useEffect, useState } from 'react';
import { api } from '@/libs/api';
import { supabase } from '@/libs/supabase';

type UserData = {
  id: string;
  email: string;
  display_name: string | null;
  username: string | null;
  image_url: string | null;
  coin_balance: number;
  monthly_image_credits: number;
  monthly_video_credits: number;
  subscription_status: string;
  subscription_tier: string | null;
  subscription_expires_at: string | null;
  preferences: unknown;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  isPremium: boolean;
  authLoading: boolean;
  token: string | null;
  user: UserData | null;
};

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  isPremium: false,
  authLoading: true,
  token: null,
  user: null,
});

const fetchUserData = async (accessToken: string): Promise<UserData | null> => {
  const res = await api.get('/users/me', accessToken);
  return res?.content ?? null;
};

export const AuthProvider = (props: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isPremium] = useState(true);

  // The Supabase session is what signs someone in; the profile fetched from the
  // API is detail on top of it, so losing that must not sign them out.
  const isAuthenticated = !!token;

  useEffect(() => {
    // TODO: remove setIsPremium override when premium accounts are available for testing
    const updateUser = (userData: UserData | null) => setUser(userData);

    // onAuthStateChange fires INITIAL_SESSION on first subscription, so a
    // separate getSession() call is not needed and causes lock contention in
    // React Strict Mode when two concurrent getSession() calls compete for the
    // same Web Lock.
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setToken(session?.access_token ?? null);
      if (!session) {
        updateUser(null);
        setAuthLoading(false);
        return;
      }
      // An unreachable API must neither reject here, which would leave the app
      // pinned on its loading state, nor clear a profile already on screen.
      const userData = await fetchUserData(session.access_token).catch(() => null);
      if (userData) {
        updateUser(userData);
      }
      setAuthLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext value={{ isAuthenticated, isPremium, authLoading, token, user }}>
      {props.children}
    </AuthContext>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => use(AuthContext);
