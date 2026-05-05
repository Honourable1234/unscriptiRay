'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BouncingDots } from '@/components/general/BouncingDots';
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
      await register(session.user.id, session.user.email, session.access_token);
      router.push('/');
    });
  }, [router]);

  return (
    <div className="flex h-full items-center justify-center">
      <BouncingDots />
    </div>
  );
}
