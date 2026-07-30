'use client';

import type { Invoice, SubscriptionStatus } from '@/services/useSubscriptionService';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { ChevronLeftIcon, DownloadIcon } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import { Link } from '@/libs/I18nNavigation';
import { useSubscriptionService } from '@/services/useSubscriptionService';

export const SubscriptionSection = () => {
  const { user, isAuthenticated } = useAuth();
  const { getStatus, cancelSubscription, getInvoices } = useSubscriptionService();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    // Fall back to the user data already on screen if the fetch fails.
    getStatus().then(res => setSubscription(res.content)).catch(() => {});
    getInvoices().then(res => setInvoices(Array.isArray(res.content) ? res.content : [])).catch(() => setInvoices([]));
  }, []);

  const status = subscription?.status ?? user?.subscription_status;
  const tier = subscription?.tier ?? user?.subscription_tier;
  const expiresAt = subscription?.current_period_end ?? user?.subscription_expires_at;
  const isActivePaid = !!tier && status === 'active';
  const tierLabel = tier || 'Free';
  const expiresLabel = expiresAt ? new Date(expiresAt).toLocaleDateString() : null;

  const handleCancel = () => {
    // Guard against double-submits and cancelling a plan that is not actually active.
    if (cancelling || !isActivePaid) {
      return;
    }
    setCancelling(true);
    cancelSubscription()
      .then(async (res) => {
        // Money-critical: only claim the subscription is cancelled when the API
        // explicitly confirms it. A 200 with success:false, a missing status, or a
        // still-active status must be surfaced as a failure, never a success.
        const cancelledStatus = res?.content?.status;
        if (res?.success !== true || !cancelledStatus || cancelledStatus === 'active') {
          toast.error(res?.message || 'Could not cancel subscription. You have not been charged for a cancellation.');
          return;
        }
        toast.success(res.message || 'Subscription cancelled.');
        setShowCancelConfirm(false);
        setSubscription(prev => (prev ? { ...prev, status: cancelledStatus } : prev));
        // Reconcile with the server as the source of truth for billing state.
        try {
          const fresh = await getStatus();
          setSubscription(fresh.content);
        } catch {
          // Keep the confirmed cancelled status if the reconcile fetch fails.
        }
      })
      .catch(() => toast.error('Failed to cancel subscription. Please try again.'))
      .finally(() => setCancelling(false));
  };

  return (
    <div className="flex flex-col gap-4">
      <Link href="/profile" className="flex w-fit cursor-pointer items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black-60 text-white [&>svg]:h-4 [&>svg]:w-3.5">
          <ChevronLeftIcon />
        </span>
        <span className="text-lg font-bold text-white">Subscription</span>
      </Link>

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
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="cursor-pointer rounded-2xl border border-error-200 px-4 py-3 text-sm font-semibold text-error-200 hover:bg-error-200/10"
            >
              Cancel Subscription
            </button>
          )
        : isAuthenticated
          ? (
              <div className="flex items-center justify-between rounded-2xl border border-black-40 bg-black-100 px-4 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-white">Upgrade to Premium</p>
                  <p className="text-xs text-white-50">Unlock premium features</p>
                </div>
                <button className="cursor-pointer rounded-full bg-primary-100 px-4 py-2 text-xs font-semibold text-white">
                  Upgrade
                </button>
              </div>
            )
          : (
              <div className="flex items-center justify-between rounded-2xl border border-black-40 bg-black-100 px-4 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-white">Get Started</p>
                  <p className="text-xs text-white-50">Sign up to unlock premium features</p>
                </div>
                <Link href="/sign-up" className="cursor-pointer rounded-full bg-primary-100 px-4 py-2 text-xs font-semibold text-white">
                  Sign Up Now
                </Link>
              </div>
            )}

      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-white">Billing history</p>
        {invoices === null
          ? (
              <div className="flex flex-col gap-2">
                {[0, 1, 2].map(i => (
                  <div key={i} className="h-14 animate-pulse rounded-2xl bg-black-60" />
                ))}
              </div>
            )
          : invoices.length === 0
            ? (
                <div className="rounded-2xl border border-black-40 bg-black-100 px-4 py-6 text-center">
                  <p className="text-sm text-white-50">No invoices yet.</p>
                </div>
              )
            : (
                <div className="overflow-x-auto rounded-2xl border border-black-40 bg-black-100">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-black-40 text-xs text-white-50">
                        <th className="px-4 py-3 font-medium">Amount</th>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 text-right font-medium">Invoice</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => {
                        const link = invoice.pdf_url ?? invoice.invoice_url;
                        return (
                          <tr key={invoice.id} className="border-b border-black-40 last:border-0">
                            <td className="px-4 py-3 font-semibold whitespace-nowrap text-white">
                              {new Intl.NumberFormat('en-US', { style: 'currency', currency: (invoice.currency || 'usd').toUpperCase() }).format(invoice.amount / 100)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-white-75">
                              {new Date(invoice.created * 1000).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-white-75 capitalize">
                              {invoice.status}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {link
                                ? (
                                    <a
                                      href={link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 rounded-full bg-black-60 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black-40 [&_svg]:size-3.5"
                                    >
                                      <DownloadIcon />
                                      PDF
                                    </a>
                                  )
                                : <span className="text-xs text-white-50">-</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
      </div>

      {showCancelConfirm && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => !cancelling && setShowCancelConfirm(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && !cancelling) {
              setShowCancelConfirm(false);
            }
          }}
        >
          <div
            role="presentation"
            className="w-full max-w-100 rounded-2xl border border-white-25 bg-black-80 px-5 py-6"
            onClick={e => e.stopPropagation()}
            onKeyDown={e => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold text-white">Cancel Subscription</h2>
            <p className="mt-2 text-sm text-white-75">
              Are you sure you want to cancel your subscription? You&apos;ll keep access until
              {' '}
              {expiresLabel ?? 'the end of your billing period'}
              .
            </p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={cancelling}
                className="flex-1 cursor-pointer rounded-2xl border border-black-40 px-4 py-2.5 text-sm text-white disabled:opacity-50"
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
        </div>
      )}
    </div>
  );
};
