import { useAuth } from '@/context/AuthContext';
import { api } from '@/libs/api';

export type Wallet = {
  id: string;
  user_id: string;
  coin_balance: number;
  monthly_image_credits: number;
  monthly_video_credits: number;
  credits_reset_at: string | null;
  created_at: string;
  updated_at: string;
};

type WalletResponse = {
  success: boolean;
  message: string;
  content: Wallet;
};

export type WalletTransaction = {
  id: string;
  user_id: string;
  /** Signed coin movement: positive tops the wallet up, negative spends from it. */
  amount: number;
  currency: string;
  /** What moved the coins, e.g. `image_gen`. */
  reason: string;
  reference_id: string | null;
  created_at: string;
};

/** Coin packages the purchase endpoint accepts; anything else is rejected. */
export type CoinPackage = '100' | '500' | '1000' | '5000';

type Pagination = {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

type TransactionsResponse = {
  success: boolean;
  message: string;
  content: { rows: WalletTransaction[]; pagination: Pagination };
};

type PurchaseResponse = {
  success: boolean;
  message: string;
  content: {
    /** Real Stripe Checkout session, or the caller's own `success_url` in stub mode. */
    checkout_url: string;
    /** Coins the pack added. Stub mode only: Stripe credits via webhook instead. */
    coins?: number;
    /** Balance after crediting. Stub mode only. */
    coin_balance?: number;
    /**
     * Set while the backend has no Stripe key. The purchase is still real — the
     * pack is credited immediately — but there is no payment page to visit.
     */
    stub?: boolean;
  };
};

export const useWalletService = () => {
  const { token } = useAuth();

  const getWallet = () =>
    api.get('/wallet', token ?? undefined) as Promise<WalletResponse>;

  const getTransactions = (page?: number) =>
    api.get(`/wallet/transactions${page ? `?page=${page}` : ''}`, token ?? undefined) as Promise<TransactionsResponse>;

  const purchaseCoins = (body: { package: CoinPackage; success_url: string; cancel_url: string }) =>
    api.post('/wallet/purchase', body, token ?? undefined) as Promise<PurchaseResponse>;

  return { getWallet, getTransactions, purchaseCoins };
};
