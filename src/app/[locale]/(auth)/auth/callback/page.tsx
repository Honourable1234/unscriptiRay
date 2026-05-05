'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BouncingDots } from '@/components/general/BouncingDots';
import { supabase } from '@/libs/supabase';
import { useAuthService } from '@/services/useAuthService';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { register } = useAuthService();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        subscription.unsubscribe();
        await register(session.user.id, session.user.email, session.access_token);
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
