'use client';

import { CoinIcon, CommentIcon, FeedIcon, MediaIcon, PhoneIcon } from '@/components/icons';

const features = [
  { icon: <CoinIcon />, label: '+1,000 Dreamcoins Monthly', action: null },
  { icon: <FeedIcon />, label: 'Unlimited Feed', action: null },
  { icon: <CommentIcon />, label: 'Unlimited Messages', action: 'Try Now' },
  { icon: <MediaIcon />, label: 'Custom Images & Videos', action: 'Try Now' },
  { icon: <PhoneIcon />, label: 'Phone Calls', action: 'Try Now' },
];

export const FeedPaywall = () => {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center px-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-black-80 shadow-2xl">
        {/* Header */}
        <div className="bg-linear-to-r from-premium-100 to-primary-200 px-6 py-5 text-center">
          <h2 className="text-xl font-extrabold tracking-wide text-white uppercase italic">
            Free Feed
            <br />
            Limit Reached!
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="mb-4 text-center text-sm text-white/80">
            You must upgrade to premium to get an unlimited feed
          </p>

          <div className="mb-5 text-center text-xs font-semibold tracking-widest text-primary-100">
            ✦ Premium Features ✦
          </div>

          <div className="mb-6 flex flex-col gap-3">
            {features.map(f => (
              <div key={f.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-white">
                  <span className="text-primary-100">{f.icon}</span>
                  <span className="text-sm">{f.label}</span>
                </div>
                {f.action && (
                  <button className="cursor-pointer rounded-lg bg-primary-100 px-3 py-1 text-xs font-semibold text-white hover:opacity-90">
                    {f.action}
                  </button>
                )}
              </div>
            ))}

            <div className="flex items-center gap-2.5 text-white/60">
              <span className="ml-0.5 text-lg">+</span>
              <span className="text-sm">& Much More</span>
            </div>
          </div>

          <button className="w-full cursor-pointer rounded-xl bg-linear-to-r from-premium-100 to-primary-200 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90">
            ♡ Click Here To Upgrade Now ♡
          </button>
        </div>
      </div>
    </div>
  );
};
