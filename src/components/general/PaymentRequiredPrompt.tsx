'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { setPaymentRequiredHandler } from '@/libs/api';
import { InsufficientCoinsModal } from './InsufficientCoinsModal';

/**
 * Raises the buy-coins prompt whenever any request is refused for lack of
 * coins, so every screen gets it without wiring the 402 through each caller.
 */
export const PaymentRequiredPrompt = () => {
  const { isAuthenticated } = useAuth();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Guests are asked to sign up instead, and that prompt is raised elsewhere.
    if (!isAuthenticated) {
      return;
    }
    setPaymentRequiredHandler(error => setMessage(error.message));
    return () => setPaymentRequiredHandler(null);
  }, [isAuthenticated]);

  if (!message) {
    return null;
  }

  return <InsufficientCoinsModal description={message} onClose={() => setMessage(null)} />;
};
