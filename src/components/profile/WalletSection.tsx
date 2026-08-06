'use client';

import type { WalletTransaction } from '@/services/useWalletService';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CoinPackageGrid } from '@/components/general/CoinPackageGrid';
import { ChevronLeftIcon, CoinIcon } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import { Link } from '@/libs/I18nNavigation';
import { useWalletService } from '@/services/useWalletService';

/**
 * Formats a signed coin movement for the transaction table.
 * @param amount - Coins added (positive) or spent (negative).
 * @returns The amount with an explicit sign.
 */
const signedAmount = (amount: number) => (amount > 0 ? `+${amount}` : `${amount}`);

/**
 * Builds the page buttons to show, keeping the first, last and neighbouring
 * pages and collapsing the rest into gaps.
 * @param page - Page currently on screen.
 * @param pageCount - Total number of pages.
 * @returns Page numbers in order, with null marking a collapsed gap.
 */
const pagesToShow = (page: number, pageCount: number) => {
  const shown = Array.from({ length: pageCount }, (_, i) => i + 1)
    .filter(p => p === 1 || p === pageCount || Math.abs(p - page) <= 1);
  return shown.flatMap<number | null>((p, i) => {
    const previous = shown[i - 1];
    return previous && p - previous > 1 ? [null, p] : [p];
  });
};

export const WalletSection = () => {
  const t = useTranslations('WalletSection');
  const { isAuthenticated } = useAuth();
  const { wallet, balance, refresh: refreshWallet } = useWallet();
  const searchParams = useSearchParams();
  const { getTransactions } = useWalletService();
  const [transactions, setTransactions] = useState<WalletTransaction[] | null>(null);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [total, setTotal] = useState(0);
  const [isPaging, setIsPaging] = useState(false);

  /**
   * Loads a page of history, replacing the table on page 1 and appending after it.
   * @param nextPage - One-based page to fetch.
   * @returns A promise that settles once the page is applied.
   */
  const fetchTransactions = (nextPage: number) =>
    getTransactions(nextPage).then((res) => {
      setTransactions(res.content.rows);
      setPage(res.content.pagination.page);
      setPageCount(res.content.pagination.pageCount);
      setTotal(res.content.pagination.total);
    });

  const goToPage = (nextPage: number) => {
    if (isPaging || nextPage === page || nextPage < 1 || nextPage > pageCount) {
      return;
    }
    setIsPaging(true);
    fetchTransactions(nextPage).catch(() => {}).finally(() => setIsPaging(false));
  };

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    fetchTransactions(1).catch(() => setTransactions([]));
  }, [isAuthenticated]);

  // Stripe sends the buyer back here, so the outcome is reported once on return.
  useEffect(() => {
    const outcome = searchParams.get('purchase');
    if (outcome === 'success') {
      toast.success(t('toast_payment_received'));
      refreshWallet();
    } else if (outcome === 'cancelled') {
      toast.info(t('toast_purchase_cancelled'));
    }
  }, []);

  // Signed-out visitors have nothing to fetch, so the table skips its skeleton.
  const rows = isAuthenticated ? transactions : [];
  const pageNumbers = pagesToShow(page, pageCount);

  return (
    <div className="flex flex-col gap-4">
      <Link href="/profile" className="flex w-fit cursor-pointer items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black-60 text-white [&>svg]:h-4 [&>svg]:w-3.5">
          <ChevronLeftIcon />
        </span>
        <span className="text-lg font-bold text-white">{t('title')}</span>
      </Link>

      {/* Balance */}
      <div className="rounded-2xl border border-black-40 bg-black-100 px-4 py-4">
        <p className="text-sm text-white-50">{t('balance')}</p>
        <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-white">
          <CoinIcon />
          {balance.toLocaleString()}
          <span className="text-sm font-medium text-white-50">{t('dreamcoins')}</span>
        </p>
        {wallet && (
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 border-t border-black-40 pt-3 text-xs text-white-50">
            <span>
              {t('image_credits')}
              {' '}
              <span className="font-semibold text-white">{wallet.monthly_image_credits}</span>
            </span>
            <span>
              {t('video_credits')}
              {' '}
              <span className="font-semibold text-white">{wallet.monthly_video_credits}</span>
            </span>
            <span>
              {t('credits_reset')}
              {' '}
              <span className="font-semibold text-white">
                {/* Null until the first monthly cycle is scheduled for the wallet. */}
                {wallet.credits_reset_at ? new Date(wallet.credits_reset_at).toLocaleDateString() : t('not_scheduled')}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Buy coins */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-white">{t('buy_more_coins')}</p>
        {isAuthenticated
          ? <CoinPackageGrid onPurchased={() => fetchTransactions(1).catch(() => {})} />
          : (
              <div className="flex items-center justify-between rounded-2xl border border-black-40 bg-black-100 px-4 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-white">{t('get_started')}</p>
                  <p className="text-xs text-white-50">{t('get_started_caption')}</p>
                </div>
                <Link href="/sign-up" className="cursor-pointer rounded-full bg-primary-100 px-4 py-2 text-xs font-semibold text-white">
                  {t('sign_up_now')}
                </Link>
              </div>
            )}
      </div>

      {/* Transactions */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-white">{t('transactions')}</p>
        {rows === null
          ? (
              <div className="flex flex-col gap-2">
                {[0, 1, 2].map(i => (
                  <div key={i} className="h-14 animate-pulse rounded-2xl bg-black-60" />
                ))}
              </div>
            )
          : rows.length === 0
            ? (
                <div className="rounded-2xl border border-black-40 bg-black-100 px-4 py-6 text-center">
                  <p className="text-sm text-white-50">{t('no_transactions')}</p>
                </div>
              )
            : (
                <div className="overflow-x-auto rounded-2xl border border-black-40 bg-black-100">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-black-40 text-xs text-white-50">
                        <th className="px-4 py-3 font-medium">{t('column_reason')}</th>
                        <th className="px-4 py-3 font-medium">{t('column_date')}</th>
                        <th className="px-4 py-3 text-right font-medium">{t('column_coins')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(transaction => (
                        <tr key={transaction.id} className="border-b border-black-40 last:border-0">
                          <td className="px-4 py-3 whitespace-nowrap text-white capitalize">
                            {transaction.reason.replace(/[_-]+/g, ' ')}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-white-75">
                            {new Date(transaction.created_at).toLocaleString()}
                          </td>
                          <td className={`px-4 py-3 text-right font-semibold whitespace-nowrap ${transaction.amount < 0 ? 'text-white-75' : 'text-primary-100'}`}>
                            {signedAmount(transaction.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
        {pageCount > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-white-50">
              {t('pagination', { page, pageCount, total })}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={isPaging || page === 1}
                className="cursor-pointer rounded-lg bg-black-60 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black-40 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t('prev')}
              </button>
              {pageNumbers.map((pageNumber, i) => (
                pageNumber === null
                  // eslint-disable-next-line react/no-array-index-key -- gaps have no id of their own
                  ? <span key={`gap-${i}`} className="px-1 text-xs text-white-50">…</span>
                  : (
                      <button
                        key={pageNumber}
                        onClick={() => goToPage(pageNumber)}
                        disabled={isPaging}
                        className={`min-w-8 cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-semibold disabled:cursor-not-allowed ${pageNumber === page ? 'bg-primary-100 text-white' : 'bg-black-60 text-white-75 hover:bg-black-40'}`}
                      >
                        {pageNumber}
                      </button>
                    )
              ))}
              <button
                onClick={() => goToPage(page + 1)}
                disabled={isPaging || page === pageCount}
                className="cursor-pointer rounded-lg bg-black-60 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black-40 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t('next')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
