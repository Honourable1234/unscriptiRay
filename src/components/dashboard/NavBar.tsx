'use client';

import Image from 'next/image';
import { useState } from 'react';
import { BouncingDots } from '@/components/general/BouncingDots';
import { useAuth } from '@/context/AuthContext';
import { Link } from '@/libs/I18nNavigation';
import { supabase } from '@/libs/supabase';
import { BellIcon, CoinIcon, UpgradeIcon } from '../icons';

export const NavBar = (props: { className?: string }) => {
  const { isAuthenticated, isPremium, authLoading, user } = useAuth();
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  return (
    <div className={props.className}>
      <div className="flex h-15 w-full items-center justify-between px-4 sm:px-6 md:h-25 md:px-8 ">
        <Link href="/" className="relative h-full w-15 md:w-25.5">
          <Image src="/General/Unscripti-logo.png" fill alt="Unscripti Logo" sizes="102px" loading="eager" className="h-full object-contain mix-blend-luminosity" />
        </Link>
        {authLoading && (
          <div className="flex gap-3 md:mr-21">
            <div className="h-9 w-20 animate-pulse rounded-lg bg-black-60" />
            <div className="hidden h-9 w-20 animate-pulse rounded-lg bg-black-60 sm:block" />
          </div>
        )}
        {!authLoading && !isAuthenticated && (
          <div className="flex gap-3 md:mr-21">
            <Link href="/sign-in" className="cursor-pointer rounded-lg border border-primary-100 px-6 py-2 text-sm font-semibold text-primary-100 transition-opacity hover:opacity-80">Log In</Link>
            <Link href="/sign-up" className="hidden cursor-pointer rounded-lg border border-primary-100 bg-primary-100 px-6 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80 sm:block">Sign up</Link>
          </div>
        )}
        {!authLoading && isAuthenticated && (
          <div className="flex h-fit items-center gap-2 sm:gap-6">
            <div className="flex cursor-pointer items-center justify-center gap-1 rounded-md bg-black-60 px-3 py-2 font-semibold hover:bg-black-40">
              <CoinIcon />
              <span className="text-xs whitespace-nowrap text-white">
                {user?.coin_balance ?? 0}
                {' '}
                Coins
              </span>
            </div>
            {!isPremium && (
              <button
                className="hidden cursor-pointer items-center gap-3 rounded-xl bg-gradient-to-r from-error-100 to-primary-200 px-3 py-2 text-xs font-semibold text-white sm:flex"
                disabled={upgradeLoading}
                onClick={() => {
                  setUpgradeLoading(true);
                  setTimeout(() => setUpgradeLoading(false), 3000);
                }}
              >
                <UpgradeIcon />
                {upgradeLoading ? <BouncingDots /> : <span>Upgrade</span>}
              </button>
            )}
            <BellIcon />
            <div className="group relative h-6 w-6 md:h-10 md:w-10">
              <Image src={user?.image_url ?? '/General/Profile.png'} alt="User Avatar" fill sizes="40px" className="cursor-pointer rounded-full" />
              <div className="absolute top-full right-0 mt-0 hidden w-32 rounded-xl border border-black-40 bg-black-100 py-1 shadow-lg group-hover:block">
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="w-full cursor-pointer px-4 py-2.5 text-left text-sm text-white hover:bg-black-40"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
