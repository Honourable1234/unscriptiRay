'use client';

import type { Character } from '@/data/characters';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { BouncingDots } from '@/components/general/BouncingDots';
import { SignUpPromptModal } from '@/components/general/SignUpPromptModal';
import { LockIcon2 } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import { useCharacterService } from '@/services/useCharacterService';

export const CharacterUnlockButton = (props: { character: Character; onUnlocked: () => void }) => {
  const t = useTranslations('CharacterUnlockButton');
  const { isAuthenticated } = useAuth();
  const { refresh: refreshWallet } = useWallet();
  const { purchaseCollection } = useCharacterService();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(false);

  const handleClick = () => {
    // Guests have no wallet to spend from, so ask them to sign up first.
    if (!isAuthenticated) {
      setShowSignUpPrompt(true);
      return;
    }
    setIsLoading(true);
    setError(null);
    purchaseCollection(String(props.character.id))
      .then((res) => {
        // Money-critical: only report an unlock when the API confirms one.
        if (res?.success !== true) {
          const message = res?.message ?? t('purchase_failed');
          toast.error(message);
          setError(message);
          return;
        }
        toast.success(res.content?.already_purchased ? t('already_unlocked') : t('unlocked'));
        // Coins were spent, so every balance on screen is now stale.
        refreshWallet();
        props.onUnlocked();
      })
      .catch((requestError) => {
        // A 402 arrives here carrying the API's own "insufficient credits" message.
        const message = requestError instanceof Error ? requestError.message : t('error');
        toast.error(message);
        setError(message);
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="m-auto mb-6 flex flex-col items-center gap-2">
      <button
        className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-premium-100 to-primary-200 p-3 text-xs font-semibold text-white md:p-4 md:text-sm"
        onClick={handleClick}
        disabled={isLoading}
      >
        <LockIcon2 />
        {isLoading ? <BouncingDots /> : t('unlock', { name: props.character.name })}
      </button>
      {error && <p className="text-xs text-error-200">{error}</p>}

      {showSignUpPrompt && (
        <SignUpPromptModal
          description={t('sign_up_prompt', { name: props.character.name })}
          onClose={() => setShowSignUpPrompt(false)}
        />
      )}
    </div>
  );
};
