'use client';

import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { ChevronLeftIcon, ChevronRightIcon, CoinIcon } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';

const RightChevron = () => (
  <span className="h-6 w-6 overflow-hidden [&>svg]:h-6 [&>svg]:w-3"><ChevronRightIcon /></span>
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
  const [view, setView] = useState<'list' | 'subscription'>('list');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const isActivePaid = !!user?.subscription_tier && user.subscription_status === 'active';
  const tierLabel = user?.subscription_tier ? user.subscription_tier : 'Free';
  const expiresLabel = user?.subscription_expires_at
    ? new Date(user.subscription_expires_at).toLocaleDateString()
    : null;

  // TODO: replace with a real cancel-subscription API call.
  const handleCancel = () => {
    setCancelling(true);
    setTimeout(() => {
      toast.success('Subscription cancellation requested.');
      setShowCancelConfirm(false);
      setCancelling(false);
    }, 600);
  };

  if (view === 'subscription') {
    return (
      <div className="flex flex-col gap-4">
        <button onClick={() => setView('list')} className="flex cursor-pointer items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black-60 text-white [&>svg]:h-4 [&>svg]:w-3.5">
            <ChevronLeftIcon />
          </span>
          <span className="text-lg font-bold text-white">Subscription</span>
        </button>

        <div className="rounded-2xl border border-black-40 bg-black-100 px-4 py-4">
          <p className="text-sm text-white-50">Current plan</p>
          <p className="mt-1 text-base font-semibold text-white capitalize">{tierLabel}</p>
          {expiresLabel && (
            <p className="mt-1 text-xs text-white-50">
              Renews/expires
              {' '}
              {expiresLabel}
            </p>
          )}
        </div>

        {isActivePaid
          ? (
              <>
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="cursor-pointer rounded-2xl border border-error-200 px-4 py-3 text-sm font-semibold text-error-200 hover:bg-error-200/10"
                >
                  Cancel Subscription
                </button>
                {showCancelConfirm && (
                  <div className="rounded-2xl border border-black-40 bg-black-100 px-4 py-4">
                    <p className="text-sm text-white">
                      Are you sure you want to cancel your subscription? You&apos;ll keep access until
                      {' '}
                      {expiresLabel ?? 'the end of your billing period'}
                      .
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => setShowCancelConfirm(false)}
                        className="flex-1 cursor-pointer rounded-2xl border border-black-40 px-4 py-2.5 text-sm text-white"
                      >
                        Keep Subscription
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={cancelling}
                        className="flex-1 cursor-pointer rounded-2xl bg-error-200 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        {cancelling ? '…' : 'Confirm Cancel'}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )
          : (
              <div className="flex items-center justify-between rounded-2xl border border-black-40 bg-black-100 px-4 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-white">Get Started</p>
                  <p className="text-xs text-white-50">Sign up to unlock premium features</p>
                </div>
                <button className="cursor-pointer rounded-full bg-primary-100 px-4 py-2 text-xs font-semibold text-white">
                  Sign Up Now
                </button>
              </div>
            )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 rounded-2xl border border-black-40 bg-black-100 px-4 py-4">
        <div className="relative h-14 w-14 flex-shrink-0">
          <Image src={user?.image_url ?? '/General/Profile.png'} alt="" fill sizes="56px" className="rounded-full object-cover" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{user?.display_name ?? user?.username ?? 'Unnamed'}</p>
          {user?.username && user?.display_name && <p className="truncate text-xs text-white-50">{`@${user.username}`}</p>}
          {user?.email && <p className="truncate text-xs text-white-50">{user.email}</p>}
        </div>
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
        <button
          onClick={() => setView('subscription')}
          className="flex w-full cursor-pointer items-center justify-between px-4 py-3.5 text-left hover:bg-black-40"
        >
          <div>
            <p className="text-sm font-semibold text-white">Subscription</p>
            <p className="text-xs text-white-50 capitalize">{tierLabel}</p>
          </div>
          <RightChevron />
        </button>
      </div>

      <div className="flex flex-col divide-y divide-black-40 rounded-2xl border border-black-40 bg-black-100">
        <PlaceholderRow label="Preferences & Notifications" />
        <PlaceholderRow label="Language" />
      </div>

      <div className="rounded-2xl border border-black-40 bg-black-100">
        <PlaceholderRow label="Support & Feedback" />
      </div>

      <div className="rounded-2xl border border-black-40 bg-black-100">
        <PlaceholderRow label="Legal" />
      </div>
    </div>
  );
};
