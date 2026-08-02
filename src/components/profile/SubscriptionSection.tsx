'use client';

import type { Invoice, SubscriptionStatus, SubscriptionTier } from '@/services/useSubscriptionService';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ChevronLeftIcon, DownloadIcon } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import { Link } from '@/libs/I18nNavigation';
import { useSubscriptionService } from '@/services/useSubscriptionService';

/**
 * Decides whether a URL the billing API returned actually leads to Stripe.
 * A response that echoes back the URL it was given without flagging itself as a
 * stub would navigate nowhere while looking like a payment that went through.
 * @param url - The checkout or portal URL from the response.
 * @returns True when the URL leaves the app and can be redirected to.
 */
const leadsToStripe = (url: string) =>
  new URL(url, window.location.origin).origin !== window.location.origin;

export const SubscriptionSection = () => {
  const t = useTranslations('SubscriptionSection');
  const { user, isAuthenticated } = useAuth();
  const { refresh: refreshWallet } = useWallet();
  const { getStatus, cancelSubscription, getInvoices, createCheckout, changeTier, openPortal } = useSubscriptionService();
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [pendingTier, setPendingTier] = useState<SubscriptionTier | null>(null);
  const [openingPortal, setOpeningPortal] = useState(false);

  // Stripe owns the pricing, so plans are listed by billing period and the amount
  // to charge is settled at checkout. Free has no tier: it is what an account
  // falls back to, reached by cancelling rather than by checkout.
  const plans: { tier: SubscriptionTier | null; label: string; caption: string }[] = [
    { tier: null, label: t('plan_free'), caption: t('plan_free_caption') },
    { tier: 'monthly', label: t('plan_monthly'), caption: t('plan_monthly_caption') },
    { tier: 'yearly', label: t('plan_yearly'), caption: t('plan_yearly_caption') },
  ];

  useEffect(() => {
    // Fall back to the user data already on screen if the fetch fails.
    getStatus().then(res => setSubscription(res.content)).catch(() => {});
    getInvoices().then(res => setInvoices(Array.isArray(res.content) ? res.content : [])).catch(() => setInvoices([]));
  }, []);

  // Stripe sends the buyer back here, so the outcome is reported once on return.
  // The status fetch above doubles as the reconcile with the server.
  useEffect(() => {
    const outcome = searchParams.get('subscription');
    if (outcome === 'success') {
      toast.success(t('toast_payment_received'));
    } else if (outcome === 'cancelled') {
      toast.info(t('toast_upgrade_cancelled'));
    } else if (outcome === 'portal') {
      // Coming back from the portal looks like a bare page reload otherwise.
      toast.info(t('toast_back_from_portal'));
    }
  }, []);

  const status = subscription?.status ?? user?.subscription_status;
  const tier = subscription?.tier ?? user?.subscription_tier;
  const expiresAt = subscription?.current_period_end ?? user?.subscription_expires_at;
  const isActivePaid = !!tier && status === 'active';
  const tierLabel = tier || t('plan_free');
  const expiresLabel = expiresAt ? new Date(expiresAt).toLocaleDateString() : null;
  const currentTier = tier?.toLowerCase();
  const actionLabel = isActivePaid ? t('action_switch') : t('action_upgrade');

  const handleSelectTier = (nextTier: SubscriptionTier) => {
    // Guard against double-submits while a checkout session is being opened.
    if (pendingTier) {
      return;
    }
    setPendingTier(nextTier);
    const returnUrl = `${window.location.origin}${window.location.pathname}`;
    const body = {
      tier: nextTier,
      success_url: `${returnUrl}?subscription=success`,
      cancel_url: `${returnUrl}?subscription=cancelled`,
    };
    // Checkout opens a first subscription; an active one moves period via change-tier.
    const request = isActivePaid ? changeTier(body) : createCheckout(body);
    request
      .then((res) => {
        // Money-critical: only leave the page when the API actually returns a
        // checkout session, never on a 200 that carries no URL.
        const checkoutUrl = res?.content?.checkout_url;
        if (res?.success !== true || !checkoutUrl) {
          toast.error(res?.message || t('toast_checkout_failed'));
          setPendingTier(null);
          return;
        }
        // Without a Stripe key the plan is provisioned before the response and
        // the checkout URL is just this page, so the server is the thing to read
        // the new state from rather than somewhere to redirect to.
        if (res.content.stub) {
          toast.success(res.message || t('toast_subscription_active'));
          getStatus().then(fresh => setSubscription(fresh.content)).catch(() => {});
          // Subscribing grants coins, so the balance on screen is now stale.
          refreshWallet();
          setPendingTier(null);
          return;
        }
        // An unflagged echo of our own URL would claim a payment that never happened.
        if (!leadsToStripe(checkoutUrl)) {
          toast.error(t('toast_payments_unavailable'));
          setPendingTier(null);
          return;
        }
        window.location.href = checkoutUrl;
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : t('toast_checkout_failed'));
        setPendingTier(null);
      });
  };

  const handleOpenPortal = () => {
    if (openingPortal) {
      return;
    }
    setOpeningPortal(true);
    openPortal({ return_url: `${window.location.origin}${window.location.pathname}?subscription=portal` })
      .then((res) => {
        // Only leave the page when Stripe actually hands back a portal session.
        const portalUrl = res?.content?.portal_url;
        if (res?.success !== true || !portalUrl) {
          toast.error(res?.message || t('toast_portal_failed'));
          setOpeningPortal(false);
          return;
        }
        // The portal has nothing behind it without Stripe: the stub echoes the
        // return URL back, which would read as an unexplained page reload.
        if (res.content.stub || !leadsToStripe(portalUrl)) {
          toast.info(t('toast_portal_unavailable'));
          setOpeningPortal(false);
          return;
        }
        window.location.href = portalUrl;
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : t('toast_portal_failed'));
        setOpeningPortal(false);
      });
  };

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
          toast.error(res?.message || t('toast_cancel_failed'));
          return;
        }
        toast.success(res.message || t('toast_subscription_cancelled'));
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
      .catch(() => toast.error(t('toast_cancel_failed')))
      .finally(() => setCancelling(false));
  };

  return (
    <div className="flex flex-col gap-4">
      <Link href="/profile" className="flex w-fit cursor-pointer items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black-60 text-white [&>svg]:h-4 [&>svg]:w-3.5">
          <ChevronLeftIcon />
        </span>
        <span className="text-lg font-bold text-white">{t('title')}</span>
      </Link>

      <div className="rounded-2xl border border-black-40 bg-black-100 px-4 py-4">
        <p className="text-sm text-white-50">{t('current_plan')}</p>
        <p className="mt-1 text-base font-semibold text-white capitalize">{tierLabel}</p>
        {expiresLabel && (
          <p className="mt-1 text-xs text-white-50">
            {t('renews_expires', { date: expiresLabel })}
          </p>
        )}
      </div>

      {isAuthenticated
        ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-white">{isActivePaid ? t('change_plan') : t('upgrade_to_premium')}</p>
              {/* Three across only where a card is wide enough for its caption
                  and action side by side; below that the action sits under the
                  text so neither has to shrink. */}
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {plans.map((plan) => {
                  const planTier = plan.tier;
                  // Free is the current plan whenever no paid tier is active.
                  const isCurrent = planTier ? isActivePaid && currentTier === planTier : !isActivePaid;
                  return (
                    <div
                      key={planTier ?? 'free'}
                      className={`flex flex-col justify-between gap-3 rounded-2xl border bg-black-100 px-4 py-3.5 ${isCurrent ? 'border-primary-100' : 'border-black-40'}`}
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">{plan.label}</p>
                        <p className="text-xs text-white-50">{plan.caption}</p>
                      </div>
                      {isCurrent && (
                        <span className="rounded-full bg-black-60 px-3 py-1.5 text-center text-xs font-semibold text-white-75">
                          {t('current')}
                        </span>
                      )}
                      {/* Free is reached by cancelling, so only paid plans get a checkout button. */}
                      {!isCurrent && planTier && (
                        <button
                          onClick={() => handleSelectTier(planTier)}
                          disabled={!!pendingTier}
                          className="w-full cursor-pointer rounded-full bg-primary-100 px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {pendingTier === planTier ? t('opening') : actionLabel}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )
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

      {isActivePaid && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={handleOpenPortal}
            disabled={openingPortal}
            className="flex-1 cursor-pointer rounded-2xl border border-black-40 px-4 py-3 text-sm font-semibold text-white hover:bg-black-60 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {openingPortal ? t('opening') : t('manage_billing')}
          </button>
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="flex-1 cursor-pointer rounded-2xl border border-error-200 px-4 py-3 text-sm font-semibold text-error-200 hover:bg-error-200/10"
          >
            {t('cancel_subscription')}
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-white">{t('billing_history')}</p>
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
                  <p className="text-sm text-white-50">{t('no_invoices')}</p>
                </div>
              )
            : (
                <div className="overflow-x-auto rounded-2xl border border-black-40 bg-black-100">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-black-40 text-xs text-white-50">
                        <th className="px-4 py-3 font-medium">{t('column_amount')}</th>
                        <th className="px-4 py-3 font-medium">{t('column_date')}</th>
                        <th className="px-4 py-3 font-medium">{t('column_status')}</th>
                        <th className="px-4 py-3 text-right font-medium">{t('column_invoice')}</th>
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
                                      {t('pdf')}
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
            <h2 className="text-base font-semibold text-white">{t('cancel_subscription')}</h2>
            <p className="mt-2 text-sm text-white-75">
              {t('cancel_confirm_body', { date: expiresLabel ?? t('end_of_billing_period') })}
            </p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={cancelling}
                className="flex-1 cursor-pointer rounded-2xl border border-black-40 px-4 py-2.5 text-sm text-white disabled:opacity-50"
              >
                {t('keep_subscription')}
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 cursor-pointer rounded-2xl bg-error-200 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {cancelling ? '…' : t('confirm_cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
