'use client';
import { useEffect } from 'react';
import { BouncingDots } from '@/components/general/BouncingDots';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from '@/libs/I18nNavigation';

// Guests may browse these; the gated actions inside them prompt for sign-up.
const PUBLIC_PATHS = ['/', '/feed', '/create', '/generate', '/my-ai'];

export const AuthGuard = (props: { children: React.ReactNode }) => {
  const { isAuthenticated, authLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (!authLoading && !isAuthenticated && !isPublic) {
      router.replace('/');
    }
  }, [authLoading, isAuthenticated, isPublic, router]);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <BouncingDots />
      </div>
    );
  }

  if (!isAuthenticated && !isPublic) {
    return null;
  }

  return <>{props.children}</>;
};
