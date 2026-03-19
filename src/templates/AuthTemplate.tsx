import Image from 'next/image';

export const AuthTemplate = (props: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-black-80">
      <header className=" flex h-15 w-full items-center justify-center bg-black-100 md:h-25">
        <div className="relative h-full w-15 md:w-25.5">
          <Image src="/General/Unscripti-logo.png" fill alt="Unscripti Logo" className="h-full object-contain" />
        </div>
      </header>
      <div className="flex w-full items-center justify-center p-3 sm:p-4">
        <div className="flex w-full max-w-129.5 flex-col rounded-3xl border border-black-40 bg-black-60 p-4 shadow-sm md:p-6">
          {props.children}
        </div>
      </div>
      <footer className="flex h-15 w-full items-center justify-center bg-black-100 md:h-25">
        <p className="text-sm font-semibold text-white">Copyright© 2026. Unscripti AI</p>
      </footer>
    </div>
  );
};
