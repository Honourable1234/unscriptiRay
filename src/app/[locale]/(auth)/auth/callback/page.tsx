'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BouncingDots } from '@/components/general/BouncingDots';
import { api } from '@/libs/api';
import { supabase } from '@/libs/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    console.warn('[Callback] Listening for auth state change...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.warn('[Callback] Event:', event, '— session:', !!session);

      if (event === 'SIGNED_IN' && session) {
        subscription.unsubscribe();
        console.warn('[Callback] SIGNED_IN — user:', session.user.id, 'token (first 40):', session.access_token.slice(0, 40));
        console.warn('[Callback] Calling backend /auth/register...');
        const res = await api.post(
          '/auth/register',
          { id: session.user.id, email: session.user.email, password: '' },
          session.access_token,
        );
        console.warn('[Callback] Backend /auth/register response:', res);
        const provider = session.user.app_metadata.provider;
        router.push(provider === 'email' ? '/sign-in' : '/');
        return;
      }

      if (event === 'INITIAL_SESSION' && !session) {
        subscription.unsubscribe();
        console.warn('[Callback] No session on initial check — redirecting to /sign-in');
        router.push('/sign-in');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="flex h-full items-center justify-center">
      <BouncingDots />
    </div>
  );
}
