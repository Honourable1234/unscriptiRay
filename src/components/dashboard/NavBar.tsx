'use client';

import Image from 'next/image';
import { useState } from 'react';
import { BouncingDots } from '@/components/general/BouncingDots';
import { useAuth } from '@/context/AuthContext';
import { Link } from '@/libs/I18nNavigation';
import { BellIcon, CoinIcon, UpgradeIcon } from '../icons';

export const NavBar = () => {
  const { isAuthenticated, isPremium } = useAuth();
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  return (
    <div>
      <div className="flex h-15 w-full items-center justify-between px-4 sm:px-6 md:h-25 md:px-8 ">
        <Link href="/" className="relative h-full w-15 md:w-25.5">
          <Image src="/General/Unscripti-logo.png" fill alt="Unscripti Logo" className="h-full object-contain mix-blend-luminosity" />
        </Link>
        {!isAuthenticated && (
          <div className="flex gap-3 md:mr-21">
            <Link href="/sign-in" className="cursor-pointer rounded-lg border border-primary-100 px-6 py-2 text-sm font-semibold text-primary-100 transition-opacity hover:opacity-80">Log In</Link>
            <Link href="/sign-up" className="hidden cursor-pointer rounded-lg border border-primary-100 bg-primary-100 px-6 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80 sm:block">Sign up</Link>
          </div>
        )}
        {isAuthenticated && (
          <div className="flex h-fit items-center gap-2 sm:gap-6">
            <div className="flex cursor-pointer items-center justify-center gap-1 rounded-md bg-black-60 px-3 py-2 font-semibold hover:bg-black-40">
              <CoinIcon />
              <span className="text-xs whitespace-nowrap text-white">10 Coins</span>
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
            <div className="relative h-6 w-6 md:h-10 md:w-10">
              <Image src="/General/Profile.png" alt="User Avatar" fill className="rounded-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
