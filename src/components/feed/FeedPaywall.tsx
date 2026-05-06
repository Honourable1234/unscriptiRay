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
    <div className="absolute inset-0 z-20 flex items-center justify-center px-4 ">
      <div className="w-full max-w-md overflow-hidden rounded-2xl  bg-black-80 shadow-2xl">
        {/* Header */}
        <div className="bg-linear-to-r from-[#F483B9] to-[#ED4E9D] px-6 py-5 text-center">
          <h2 className="text-xl font-extrabold tracking-wide text-white uppercase italic">
            Free Feed
            <br />
            Limit Reached!
          </h2>
        </div>

        {/* Body */}
        <div className="bg-linear-to-t from-[#100E0F] from-2%  to-[#572232] to-98% px-4 py-5 md:px-6">
          <p className="mb-8 text-center text-sm text-white ">
            You must upgrade to premium to get an unlimited feed
          </p>

          <div className="relative mt-3 w-full border border-[#654851]">
            <div className="absolute -top-0.5 left-1/2  -translate-1/2 bg-[#572232] px-3 py-0.5 text-center text-xs font-semibold tracking-widest text-white">
              ✦ Premium Features ✦
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
                  <span className="text-sm md:text-base">{f.label}</span>
                </div>
                {f.action && (
                  <button className="cursor-pointer rounded-full border border-[#7B3A59] bg-[#462232] px-1.75 py-1.5 text-xs  text-[#F9A9D4]  hover:opacity-90 sm:px-3">
                    {f.action}
                  </button>
                )}
              </div>
            ))}

            <div className="flex items-center gap-2.5 text-white">
              <div className="rounded-lg bg-[#361e28] px-2.5 py-0.5 text-lg text-[#EC4899]">+</div>
              <span className="text-base">& Much More</span>
            </div>
          </div>

          <button className="w-full cursor-pointer rounded-xl bg-[#EF54A1] py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90">
            ♡ Click Here To Upgrade Now ♡
          </button>
        </div>
      </div>
    </div>
  );
};
