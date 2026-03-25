import Image from 'next/image';
import { BellIcon, CoinIcon, UpgradeIcon } from '../icons';
import { Button } from './Button';

export const NavBar = (props: { isAuthenticated?: boolean; isPremium?: boolean }) => {
  return (
    <div>
      <div className="flex h-15 w-full items-center justify-between px-4 sm:px-6 md:h-25 md:px-8 ">
        <div className="relative h-full w-15 md:w-25.5">
          <Image src="/General/Unscripti-logo.png" fill alt="Unscripti Logo" className="h-full object-contain mix-blend-luminosity" />
        </div>
        {!props.isAuthenticated && (
          <div className="flex gap-3 md:mr-21">
            <Button text="Log In" className="border-primary-100 text-primary-100" />
            <Button text="Sign up" className="hidden border-primary-100 bg-primary-100 text-white sm:block" />
          </div>
        )}
        {props.isAuthenticated && (
          <div className="flex h-fit items-center gap-2 sm:gap-6 xl:mr-21">
            <div className="flex cursor-pointer items-center justify-center gap-1 rounded-md bg-black-60 px-3 py-2 font-semibold hover:bg-black-40">
              <CoinIcon />
              <span className="text-xs whitespace-nowrap text-white">10 Coins</span>
            </div>
            {!props.isPremium && (
              <button className="hidden cursor-pointer items-center gap-3 rounded-xl bg-gradient-to-r from-error-100 to-primary-200 px-3 py-2 text-xs font-semibold text-white sm:flex">
                <UpgradeIcon />
                <span>Upgrade</span>
              </button>
            )}
            <BellIcon />
            <div className="relative h-6 w-6 md:h-10 md:w-10">
              <Image src="/General/Profile.png" alt="User Avatar" fill className="rounded-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
