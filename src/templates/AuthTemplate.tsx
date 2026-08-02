import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

export const AuthTemplate = async (props: {
  children: React.ReactNode;
}) => {
  const t = await getTranslations('AuthTemplate');

  return (
    <div className="flex h-screen flex-col bg-black-80">
      <header className="flex h-15 w-full shrink-0 items-center justify-center bg-black-100 md:h-25">
        <div className="relative h-full w-15 md:w-25.5">
          <Image src="/General/Unscripti-logo.png" fill alt="Unscripti Logo" sizes="(max-width: 768px) 60px, 102px" className="h-full object-contain" />
        </div>
      </header>
      <div className="flex w-full flex-1 items-center-safe justify-center overflow-y-auto p-3 pt-6 sm:p-4 sm:pt-8">
        <div className="flex w-full max-w-129.5 flex-col rounded-3xl border border-black-40 bg-black-60 p-4 shadow-sm md:p-6">
          {props.children}
        </div>
      </div>
      <footer className="flex h-15 w-full shrink-0 items-center justify-center bg-black-100 md:h-25">
        <p className="text-sm font-semibold text-white">
          {t('copyright', { year: new Date().getFullYear() })}
        </p>
      </footer>
    </div>
  );
};
