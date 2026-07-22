'use client';

import Image from 'next/image';
import { toast } from 'react-toastify';
import { ChevronRightIcon, CoinIcon } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import { Link } from '@/libs/I18nNavigation';
import { supabase } from '@/libs/supabase';

const RightChevron = () => (
  <span className="h-6 w-6 overflow-hidden [&>svg]:h-6 [&>svg]:w-3"><ChevronRightIcon /></span>
);

const SmallChevron = () => (
  <span className="flex h-3 w-3 items-center justify-center overflow-hidden [&>svg]:h-3 [&>svg]:w-1.5"><ChevronRightIcon /></span>
);

const PlaceholderRow = (props: { label: string; value?: string }) => (
  <button
    onClick={() => toast.info('Coming soon.')}
    className="flex w-full cursor-pointer items-center justify-between px-4 py-3.5 text-left hover:bg-black-40"
  >
    <div>
      <p className="text-sm font-semibold text-white">{props.label}</p>
      {props.value && <p className="text-xs text-white-50">{props.value}</p>}
    </div>
    <RightChevron />
  </button>
);

export const ProfileSection = () => {
  const { user } = useAuth();
  const tierLabel = user?.subscription_tier || 'Free';
  const avatarInitial = (user?.display_name ?? user?.username ?? user?.email ?? '?').charAt(0).toUpperCase();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-black-60">
          {user?.image_url
            ? <Image src={user.image_url} alt="" fill sizes="56px" className="object-cover" />
            : (
                <span className="flex h-full w-full items-center justify-center text-lg font-bold text-white">
                  {avatarInitial}
                </span>
              )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{user?.username ? `@${user.username}` : user?.display_name ?? 'Unnamed'}</p>
          {user?.email && <p className="truncate text-xs text-white-50">{user.email}</p>}
        </div>
        <Link
          href="/profile/view"
          className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-black-60 px-5 py-2.5 text-xs font-semibold text-white hover:bg-black-40"
        >
          Visit Profile
          <SmallChevron />
        </Link>
      </div>

      <div className="flex flex-col divide-y divide-black-40 rounded-2xl border border-black-40 bg-black-100">
        <div className="flex items-center gap-2 px-4 py-3.5">
          <CoinIcon />
          <span className="text-sm text-white">
            <span className="font-semibold">{user?.coin_balance ?? 0}</span>
            {' '}
            Dreamcoins
          </span>
        </div>
        <Link
          href="/profile/subscription"
          className="flex w-full cursor-pointer items-center justify-between px-4 py-3.5 text-left hover:bg-black-40"
        >
          <div>
            <p className="text-sm font-semibold text-white">Subscription</p>
            <p className="text-xs text-white-50 capitalize">{tierLabel}</p>
          </div>
          <RightChevron />
        </Link>
        <PlaceholderRow label="Redeem Code" />
      </div>

      <div className="flex flex-col divide-y divide-black-40 rounded-2xl border border-black-40 bg-black-100">
        <PlaceholderRow label="Preferences & Notifications" />
        <PlaceholderRow label="Language" value="Français" />
      </div>

      <div className="rounded-2xl border border-black-40 bg-black-100">
        <PlaceholderRow label="Support & Feedback" />
      </div>

      <div className="flex flex-col divide-y divide-black-40 rounded-2xl border border-black-40 bg-black-100">
        <PlaceholderRow label="Legal" />
        <PlaceholderRow label="Account Management" />
      </div>

      <button
        onClick={() => supabase.auth.signOut()}
        className="mx-auto cursor-pointer px-4 py-2 text-sm font-semibold text-white hover:text-white-75"
      >
        Sign Out
      </button>
    </div>
  );
};
