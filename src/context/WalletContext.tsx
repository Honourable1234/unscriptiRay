'use client';

import type { Wallet } from '@/services/useWalletService';
import { createContext, use, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useWalletService } from '@/services/useWalletService';

type WalletContextValue = {
  wallet: Wallet | null;
  balance: number;
  /** Refetches the wallet after anything that moves coins. */
  refresh: () => void;
};

const WalletContext = createContext<WalletContextValue>({
  wallet: null,
  balance: 0,
  refresh: () => {},
});

export const WalletProvider = (props: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const { getWallet } = useWalletService();
  const [wallet, setWallet] = useState<Wallet | null>(null);

  const refresh = () => {
    if (!isAuthenticated) {
      return;
    }
    // Keep the last known balance on screen if the refetch fails.
    getWallet().then(res => setWallet(res.content)).catch(() => {});
  };

  useEffect(() => {
    refresh();
  }, [isAuthenticated]);

  return (
    <WalletContext value={{ wallet, balance: wallet?.coin_balance ?? 0, refresh }}>
      {props.children}
    </WalletContext>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWallet = () => use(WalletContext);
