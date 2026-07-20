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

export const useSubscriptionService = () => {
  const { token } = useAuth();

  const getStatus = () =>
    api.get('/subscriptions/status', token ?? undefined) as Promise<SubscriptionStatusResponse>;

  const cancelSubscription = () =>
    api.post('/subscriptions/cancel', {}, token ?? undefined) as Promise<CancelSubscriptionResponse>;

  return { getStatus, cancelSubscription };
};
