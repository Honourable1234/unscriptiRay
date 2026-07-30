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

  return { getStatus, cancelSubscription, getInvoices };
};
