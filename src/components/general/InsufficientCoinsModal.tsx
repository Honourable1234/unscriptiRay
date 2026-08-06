'use client';

import { useTranslations } from 'next-intl';
import { CloseIcon } from '@/components/icons';
import { useWallet } from '@/context/WalletContext';
import { CoinPackageGrid } from './CoinPackageGrid';

export const InsufficientCoinsModal = (props: { description: string; onClose: () => void }) => {
  const t = useTranslations('InsufficientCoinsModal');
  const { balance } = useWallet();

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={props.onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          props.onClose();
        }
      }}
    >
      <div
        role="presentation"
        className="relative w-full max-w-110 rounded-2xl border border-white-25 bg-black-80 px-6 py-6"
        onClick={e => e.stopPropagation()}
        onKeyDown={e => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between border-b border-black-40 pb-4">
          <h2 className="text-base font-semibold text-white">{t('title')}</h2>
          <button onClick={props.onClose} className="cursor-pointer text-white-75 hover:text-white">
            <CloseIcon />
          </button>
        </div>

        <p className="text-sm text-white-75">{props.description}</p>
        <p className="mt-1 text-xs text-white-50">
          {t('balance')}
          {' '}
          <span className="font-semibold text-white">{balance.toLocaleString()}</span>
          {' '}
          {t('dreamcoins')}
        </p>

        <p className="mt-5 mb-2 text-sm font-semibold text-white">{t('top_up')}</p>
        <CoinPackageGrid
          className="grid grid-cols-2 gap-2"
          returnPath="/profile/wallet"
          onPurchased={props.onClose}
        />

        <button
          type="button"
          onClick={props.onClose}
          className="mt-2.5 w-full cursor-pointer rounded-xl border border-black-40 py-3 text-center text-sm font-semibold text-white transition-colors hover:border-primary-100 hover:text-primary-100"
        >
          {t('not_now')}
        </button>
      </div>
    </div>
  );
};
