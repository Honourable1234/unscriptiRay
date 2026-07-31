import { useAuth } from '@/context/AuthContext';
import { api } from '@/libs/api';

export type SubscriptionStatus = {
  id: string;
  provider: string;
  status: string;
  tier: string;
  current_period_start: string;
  current_period_end: string;
};

type SubscriptionStatusResponse = {
  success: boolean;
  message: string;
  content: SubscriptionStatus;
};

type CancelSubscriptionResponse = {
  success: boolean;
  message: string;
  content: { status: string };
};

/** Billing periods the checkout and change-tier endpoints accept; anything else is rejected. */
export type SubscriptionTier = 'monthly' | 'yearly';

/**
 * Set by endpoints that are not wired to Stripe yet: the URL they return is the
 * one they were given, so following it goes nowhere.
 */
type Stubbable = { stub?: boolean };

type CheckoutResponse = {
  success: boolean;
  message: string;
  content: { checkout_url: string } & Stubbable;
};

type PortalResponse = {
  success: boolean;
  message: string;
  content: { portal_url: string } & Stubbable;
};

export type Invoice = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  invoice_url: string | null;
  pdf_url: string | null;
};

type InvoicesResponse = {
  success: boolean;
  message: string;
  content: Invoice[];
};

export const useSubscriptionService = () => {
  const { token } = useAuth();

  const getStatus = () =>
    api.get('/subscriptions/status', token ?? undefined) as Promise<SubscriptionStatusResponse>;

  const cancelSubscription = () =>
    api.post('/subscriptions/cancel', {}, token ?? undefined) as Promise<CancelSubscriptionResponse>;

  const getInvoices = () =>
    api.get('/subscriptions/invoices', token ?? undefined) as Promise<InvoicesResponse>;

  // Starts a first subscription; an already-active one moves period via changeTier.
  const createCheckout = (body: { tier: SubscriptionTier; success_url: string; cancel_url: string }) =>
    api.post('/subscriptions/checkout', body, token ?? undefined) as Promise<CheckoutResponse>;

  const changeTier = (body: { tier: SubscriptionTier; success_url: string; cancel_url: string }) =>
    api.post('/subscriptions/change-tier', body, token ?? undefined) as Promise<CheckoutResponse>;

  const openPortal = (body: { return_url: string }) =>
    api.post('/subscriptions/portal', body, token ?? undefined) as Promise<PortalResponse>;

  return { getStatus, cancelSubscription, getInvoices, createCheckout, changeTier, openPortal };
};
