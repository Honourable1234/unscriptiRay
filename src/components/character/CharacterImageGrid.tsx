import Image from 'next/image';
import { useState } from 'react';
import { BouncingDots } from '@/components/general/BouncingDots';
import { PadlockIcon } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';

const UNLOCKED_COUNT = 4;

const mockImages = [
  '/General/GojoSatoru.png',
  '/General/GojoSatoru2.png',
  '/General/GojoSatoru3.png',
  '/General/GojoSatoru4.png',
  '/General/GojoSatoru.png',
  '/General/GojoSatoru2.png',
  '/General/GojoSatoru3.png',
  '/General/GojoSatoru4.png',
  '/General/GojoSatoru.png',
  '/General/GojoSatoru2.png',
];

export const CharacterImageGrid = (props: { name: string }) => {
  const { isPremium } = useAuth();
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  const handleReveal = (i: number) => {
    setLoadingIndex(i);
    setTimeout(() => setLoadingIndex(null), 3000);
  };

  return (
    <div className="flex flex-wrap gap-2.5">
      {mockImages.map((src, i) => {
        const isLocked = !isPremium && i >= UNLOCKED_COUNT;
        return (
          // eslint-disable-next-line react/no-array-index-key
          <div key={i} className="group relative aspect-[3/4] max-w-80 min-w-60 flex-1 overflow-hidden rounded-xl">
            <Image
              src={src}
              alt={props.name}
              fill
              className={`object-cover ${isLocked ? 'blur-sm brightness-50' : ''}`}
            />
            {isLocked && (
              <>
                <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-700 group-hover:opacity-0">
                  <PadlockIcon />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0 transition-opacity duration-900 group-hover:opacity-100">
                  <span className="text-lg font-semibold text-white">Secrets Locked</span>
                  <button
                    className="rounded-xl bg-gradient-to-r from-error-100 to-primary-200 px-8 py-2 text-sm font-semibold text-white"
                    disabled={loadingIndex === i}
                    onClick={() => handleReveal(i)}
                  >
                    {loadingIndex === i ? <BouncingDots /> : 'Tap to Reveal'}
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};
