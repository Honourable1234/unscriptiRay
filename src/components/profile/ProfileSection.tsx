'use client';

import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';
import { ChevronRightIcon, CoinIcon } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import { Link } from '@/libs/I18nNavigation';
import { supabase } from '@/libs/supabase';
import { LOCALE_NAMES } from '@/utils/locales';
import { ChangePasswordModal } from './ChangePasswordModal';
import { LanguageModal } from './LanguageModal';

const RightChevron = () => (
  <span className="h-6 w-6 overflow-hidden [&>svg]:h-6 [&>svg]:w-3"><ChevronRightIcon /></span>
);

const SmallChevron = () => (
  <span className="flex h-3 w-3 items-center justify-center overflow-hidden [&>svg]:h-3 [&>svg]:w-1.5"><ChevronRightIcon /></span>
);

const SettingsRow = (props: { label: string; value?: string; onClick: () => void }) => (
  <button
    onClick={props.onClick}
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
  const t = useTranslations('ProfileSection');
  const { user } = useAuth();
  const { balance } = useWallet();
  const locale = useLocale();
  const [changingPassword, setChangingPassword] = useState(false);
  const [changingLanguage, setChangingLanguage] = useState(false);
  const tierLabel = user?.subscription_tier || t('tier_free');
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
          <p className="truncate text-sm font-semibold text-white">{user?.username ? `@${user.username}` : user?.display_name ?? t('unnamed')}</p>
          {user?.email && <p className="truncate text-xs text-white-50">{user.email}</p>}
        </div>
        <Link
          href="/profile/view"
          className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-black-60 px-5 py-2.5 text-xs font-semibold text-white hover:bg-black-40"
        >
          {t('visit_profile')}
          <SmallChevron />
        </Link>
      </div>

      <div className="flex flex-col divide-y divide-black-40 rounded-2xl border border-black-40 bg-black-100">
        <div className="flex items-center gap-2 px-4 py-3.5">
          <CoinIcon />
          <span className="text-sm text-white">
            <span className="font-semibold">{balance.toLocaleString()}</span>
            {' '}
            {t('dreamcoins')}
          </span>
        </div>
        <Link
          href="/profile/wallet"
          className="flex w-full cursor-pointer items-center justify-between px-4 py-3.5 text-left hover:bg-black-40"
        >
          <div>
            <p className="text-sm font-semibold text-white">{t('wallet')}</p>
            <p className="text-xs text-white-50">{t('wallet_caption')}</p>
          </div>
          <RightChevron />
        </Link>
        <Link
          href="/profile/subscription"
          className="flex w-full cursor-pointer items-center justify-between px-4 py-3.5 text-left hover:bg-black-40"
        >
          <div>
            <p className="text-sm font-semibold text-white">{t('subscription')}</p>
            <p className="text-xs text-white-50 capitalize">{tierLabel}</p>
          </div>
          <RightChevron />
        </Link>
      </div>

      <div className="flex flex-col divide-y divide-black-40 rounded-2xl border border-black-40 bg-black-100">
        <SettingsRow
          label={t('change_password')}
          value={t('change_password_caption')}
          onClick={() => setChangingPassword(true)}
        />
        <SettingsRow label={t('language')} value={LOCALE_NAMES[locale] ?? locale} onClick={() => setChangingLanguage(true)} />
      </div>

      <button
        onClick={() => supabase.auth.signOut()}
        className="mx-auto cursor-pointer px-4 py-2 text-sm font-semibold text-white hover:text-white-75"
      >
        {t('sign_out')}
      </button>

      {changingPassword && <ChangePasswordModal onClose={() => setChangingPassword(false)} />}
      {changingLanguage && <LanguageModal current={locale} onClose={() => setChangingLanguage(false)} />}
    </div>
  );
};
