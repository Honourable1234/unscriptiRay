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

  const isAuthenticated = !!user;

  useEffect(() => {
    // TODO: remove setIsPremium override when premium accounts are available for testing
    const updateUser = (userData: UserData | null) => setUser(userData);

    supabase.auth.getSession().then(async ({ data }) => {
      setToken(data.session?.access_token ?? null);
      if (data.session) {
        updateUser(await fetchUserData(data.session.access_token));
      }
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setToken(session?.access_token ?? null);
      if (session) {
        updateUser(await fetchUserData(session.access_token));
      } else {
        updateUser(null);
      }
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
