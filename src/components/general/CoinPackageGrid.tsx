'use client';

import type { CoinPackage } from '@/services/useWalletService';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { CoinIcon } from '@/components/icons';
import { useWallet } from '@/context/WalletContext';
import { useWalletService } from '@/services/useWalletService';

// Stripe owns the pricing, so packages are listed by the coins they add and the
// amount to charge is settled at checkout.
const coinPackages: CoinPackage[] = ['100', '500', '1000', '5000'];

/**
 * Coin packs the buyer can top up with, wherever a top-up is offered.
 * @param props - Component props.
 * @param props.returnPath - Path Stripe sends the buyer back to; defaults to the current page.
 * @param props.className - Grid classes, so a modal can lay the packs out more narrowly.
 * @param props.onPurchased - Called once coins actually land, which only happens without Stripe.
 */
export const CoinPackageGrid = (props: {
  returnPath?: string;
  className?: string;
  onPurchased?: () => void;
}) => {
  const t = useTranslations('CoinPackageGrid');
  const { refresh: refreshWallet } = useWallet();
  const { purchaseCoins } = useWalletService();
  const [pendingPackage, setPendingPackage] = useState<CoinPackage | null>(null);

  const handlePurchase = (coinPackage: CoinPackage) => {
    if (pendingPackage) {
      return;
    }
    setPendingPackage(coinPackage);
    const returnUrl = `${window.location.origin}${props.returnPath ?? window.location.pathname}`;
    purchaseCoins({
      package: coinPackage,
      success_url: `${returnUrl}?purchase=success`,
      cancel_url: `${returnUrl}?purchase=cancelled`,
    })
      .then((res) => {
        // Money-critical: only leave the page when the API actually returns a
        // checkout session, never on a 200 that carries no URL.
        const checkoutUrl = res?.content?.checkout_url;
        if (res?.success !== true || !checkoutUrl) {
          toast.error(res?.message || t('toast_checkout_failed'));
          setPendingPackage(null);
          return;
        }
        // Without a Stripe key the pack is credited before the response and the
        // checkout URL is just this page, so the coins land without a round trip.
        if (res.content.stub) {
          const added = res.content.coins;
          toast.success(added ? t('toast_added_count', { count: added }) : t('toast_added'));
          refreshWallet();
          setPendingPackage(null);
          props.onPurchased?.();
          return;
        }
        window.location.href = checkoutUrl;
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : t('toast_checkout_failed'));
        setPendingPackage(null);
      });
  };

  return (
    <div className={props.className ?? 'grid grid-cols-2 gap-2 sm:grid-cols-4'}>
      {coinPackages.map(coinPackage => (
        <button
          key={coinPackage}
          onClick={() => handlePurchase(coinPackage)}
          disabled={!!pendingPackage}
          className="flex cursor-pointer flex-col items-center gap-1 rounded-2xl border border-black-40 bg-black-100 px-4 py-4 transition-colors hover:border-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CoinIcon />
          <span className="text-base font-bold text-white">{Number(coinPackage).toLocaleString()}</span>
          <span className="text-xs text-white-50">
            {pendingPackage === coinPackage ? t('opening_checkout') : t('buy')}
          </span>
        </button>
      ))}
    </div>
  );
};
