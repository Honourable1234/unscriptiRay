'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BouncingDots } from '@/components/general/BouncingDots';
import { guestToken } from '@/libs/guestToken';
import { returnUrl } from '@/libs/returnUrl';
import { supabase } from '@/libs/supabase';
import { createAuthService } from '@/services/useAuthService';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { register } = createAuthService();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        subscription.unsubscribe();
        const savedGuestToken = guestToken.get();
        await register({ id: session.user.id, email: session.user.email, token: session.access_token, guestToken: savedGuestToken ?? undefined });
        if (savedGuestToken) {
          guestToken.clear();
        }
        const provider = session.user.app_metadata.provider;
        router.push(provider === 'email' ? '/sign-in' : (returnUrl.consume() ?? '/'));
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
