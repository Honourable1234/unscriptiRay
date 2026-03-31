'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

const PUBLIC_PATHS = ['/'];

export const AuthGuard = (props: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.endsWith(p));

  useEffect(() => {
    if (!isAuthenticated && !isPublic) {
      router.replace('/');
    }
  }, [isAuthenticated, isPublic, router]);

  if (!isAuthenticated && !isPublic) {
    return null;
  }

  return <>{props.children}</>;
};
