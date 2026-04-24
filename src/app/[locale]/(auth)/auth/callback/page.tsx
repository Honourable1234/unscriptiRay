'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BouncingDots } from '@/components/general/BouncingDots';
import { api } from '@/libs/api';
import { supabase } from '@/libs/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        subscription.unsubscribe();
        await api.post(
          '/auth/register',
          { id: session.user.id, email: session.user.email, password: '' },
          session.access_token,
        );
        const provider = session.user.app_metadata.provider;
        router.push(provider === 'email' ? '/sign-in' : '/');
        return;
      }

      if (event === 'INITIAL_SESSION' && !session) {
        subscription.unsubscribe();
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
