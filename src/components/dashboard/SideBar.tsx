'use client';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { BouncingDots } from '@/components/general/BouncingDots';
import { BarsIcon, ChatIcon, CreateIcon, ExploreIcon, FeedIcon, GenerateIcon, MyAIIcon, UpgradeIcon } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import { Link } from '@/libs/I18nNavigation';

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  { label: 'Create', href: '/create', icon: <ExploreIcon /> },
  { label: 'Explore', href: '/', icon: <CreateIcon /> },
  { label: 'Chat', href: '/chat', icon: <ChatIcon /> },
  { label: 'Generate', href: '/generate', icon: <GenerateIcon /> },
  { label: 'My AI', href: '/my-ai', icon: <MyAIIcon /> },
  { label: 'Feed', href: '/feed', icon: <FeedIcon /> },
];

export const SideBar = () => {
  const { isAuthenticated, isPremium } = useAuth();
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile: slide-in drawer */}
      <div className="sm:hidden">
        <button
          onClick={() => setMobileOpen(prev => !prev)}
          className="fixed top-4 left-4 z-50 rounded-lg bg-black-100/40 p-2 text-white/40 hover:text-white-75"
        >
          <BarsIcon />
        </button>

        {/* Backdrop */}
        {mobileOpen && (
          <button
            type="button"
            aria-label="Close sidebar"
            className="fixed inset-0 z-40 cursor-default bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Drawer */}
        <div className={`fixed top-0 left-0 z-50 flex h-full w-72 flex-col justify-between bg-black-100 px-4 py-5 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setMobileOpen(false)}
              className="mb-6 flex w-fit cursor-pointer items-center justify-center rounded-lg p-2 text-white hover:bg-black-40"
            >
              <BarsIcon />
            </button>

            <nav className="flex flex-col gap-3">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.includes(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-xl p-3 text-sm font-medium transition-colors ${isActive ? 'bg-primary-100/20 text-primary-100' : 'text-white hover:bg-black-40 hover:text-white/75'}`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {!isPremium && (
            isAuthenticated
              ? (
                  <button
                    className="flex w-full cursor-pointer items-center gap-3 rounded-xl bg-gradient-to-r from-error-100 to-primary-200 p-3 text-sm font-semibold text-white"
                    disabled={upgradeLoading}
                    onClick={() => {
                      setUpgradeLoading(true);
                      setTimeout(() => setUpgradeLoading(false), 3000);
                    }}
                  >
                    <UpgradeIcon />
                    {upgradeLoading ? <BouncingDots /> : <span>Upgrade</span>}
                  </button>
                )
              : (
                  <Link href="/sign-in" className="cursor-pointer rounded-lg border border-primary-100 px-6 py-2 text-sm font-semibold text-primary-100 transition-opacity hover:opacity-80">
                    Sign In
                  </Link>
                )
          )}
        </div>
      </div>

      {/* Desktop: vertical sidebar */}
      <aside className={`hidden flex-col justify-between bg-black-100 py-5 transition-all duration-300 sm:flex ${isOpen ? 'h-screen w-45 items-start px-3 py-5' : 'h-fit w-16.5 items-center px-2'}`}>
        <div className="flex w-full flex-col gap-1">
          <button
            onClick={() => setIsOpen(prev => !prev)}
            className="mb-4 flex w-fit items-center justify-center rounded-lg p-2 text-white hover:bg-black-40 hover:text-white/75"
          >
            <BarsIcon />
          </button>

          <nav className="flex w-full flex-col gap-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.includes(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl p-3 text-sm font-medium transition-colors ${isActive ? 'bg-primary-100/20 text-primary-100' : 'text-white hover:bg-black-40 hover:text-white/75'}`}
                >
                  {item.icon}
                  {isOpen && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {!isPremium && (
          isAuthenticated
            ? (
                <button
                  className={`mt-15 flex w-full cursor-pointer items-center gap-3 rounded-xl bg-gradient-to-r from-error-100 to-primary-200 p-3 text-sm font-semibold text-white ${!isOpen && 'justify-center'}`}
                  disabled={upgradeLoading}
                  onClick={() => {
                    setUpgradeLoading(true);
                    setTimeout(() => setUpgradeLoading(false), 3000);
                  }}
                >
                  <UpgradeIcon />
                  {isOpen && (upgradeLoading ? <BouncingDots /> : <span>Upgrade</span>)}
                </button>
              )
            : (
                <Link href="/sign-in" className="cursor-pointer rounded-lg border border-primary-100 px-6 py-2 text-sm font-semibold text-primary-100 transition-opacity hover:opacity-80">
                  Sign In
                </Link>
              )
        )}
      </aside>
    </>
  );
};
