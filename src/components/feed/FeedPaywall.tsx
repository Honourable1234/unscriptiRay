'use client';

import { useTranslations } from 'next-intl';
import { CoinIcon, CommentIcon, FeedIcon, MediaIcon, PhoneIcon } from '@/components/icons';
import { Link } from '@/libs/I18nNavigation';

export const FeedPaywall = () => {
  const t = useTranslations('FeedPaywall');

  const features: { icon: React.ReactNode; label: string; action: string | null }[] = [
    { icon: <CoinIcon />, label: t('feature_coins'), action: null },
    { icon: <FeedIcon />, label: t('feature_feed'), action: null },
    { icon: <CommentIcon />, label: t('feature_messages'), action: t('try_now') },
    { icon: <MediaIcon />, label: t('feature_media'), action: t('try_now') },
    { icon: <PhoneIcon />, label: t('feature_calls'), action: t('try_now') },
  ];

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center px-4 ">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-black-80 shadow-2xl">
        {/* Header */}
        <div className="bg-linear-to-r from-[#F483B9] to-[#ED4E9D] px-6 py-5 text-center">
          <h2 className="text-xl font-extrabold tracking-wide text-white uppercase italic">
            {t('title')}
          </h2>
        </div>

        {/* Body */}
        <div className="bg-linear-to-t from-[#100E0F] from-2%  to-[#572232] to-98% px-6 py-5">
          <p className="mb-8 text-center text-sm text-white ">
            {t('subtitle')}
          </p>

          <div className="relative mt-3 w-full border border-[#654851]">
            <div className="absolute -top-0.5 left-1/2  -translate-1/2 bg-[#572232] px-3 py-0.5 text-center text-xs font-semibold tracking-widest text-white">
              {t('premium_features')}
            </div>
          </div>

          <div className="mb-6 flex flex-col gap-6 pt-8">
            {features.map(f => (
              <div key={f.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-white">
                  <div className="rounded-lg bg-[#361e28] px-2.5 py-0.5 text-lg text-[#EC4899]">
                    {' '}
                    {/* {f.icon} */}
                    +
                  </div>
                  <span className="text-base">{f.label}</span>
                </div>
                {f.action && (
                  <button className="cursor-pointer rounded-full border border-[#7B3A59] bg-[#462232] px-3 py-1.5 text-xs  text-[#F9A9D4] hover:opacity-90">
                    {f.action}
                  </button>
                )}
              </div>
            ))}

            <div className="flex items-center gap-2.5 text-white">
              <div className="rounded-lg bg-[#361e28] px-2.5 py-0.5 text-lg text-[#EC4899]">+</div>
              <span className="text-base">{t('much_more')}</span>
            </div>
          </div>

          <Link
            href="/profile/subscription"
            className="block w-full cursor-pointer rounded-xl bg-[#EF54A1] py-3.5 text-center text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            {t('upgrade_cta')}
          </Link>
        </div>
      </div>
    </div>
  );
};
