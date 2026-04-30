'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BouncingDots } from '@/components/general/BouncingDots';
import { api } from '@/libs/api';
import { supabase } from '@/libs/supabase';

export default function GoogleRegisterPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const session = data.session;
      if (!session) {
        router.push('/sign-up');
        return;
      }
      await api.post(
        '/auth/register',
        { id: session.user.id, email: session.user.email, password: '' },
        session.access_token,
      );
      router.push('/');
    });
  }, [router]);

  return (
    <div className="flex h-full items-center justify-center">
      <BouncingDots />
    </div>
  );
}
