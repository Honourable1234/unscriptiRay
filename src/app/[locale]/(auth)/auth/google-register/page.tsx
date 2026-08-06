'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BouncingDots } from '@/components/general/BouncingDots';
import { guestToken } from '@/libs/guestToken';
import { returnUrl } from '@/libs/returnUrl';
import { supabase } from '@/libs/supabase';
import { createAuthService } from '@/services/useAuthService';

export default function GoogleRegisterPage() {
  const router = useRouter();
  const { register } = createAuthService();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const session = data.session;
      if (!session) {
        router.push('/sign-up');
        return;
      }
      const savedGuestToken = guestToken.get();
      await register({ id: session.user.id, email: session.user.email, token: session.access_token, guestToken: savedGuestToken ?? undefined });
      if (savedGuestToken) {
        guestToken.clear();
      }
      router.push(returnUrl.consume() ?? '/');
    });
  }, [router]);

  return (
    <div className="flex h-full items-center justify-center">
      <BouncingDots />
    </div>
  );
}
