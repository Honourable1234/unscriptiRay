'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link } from '@/libs/I18nNavigation';
import { useNotificationService } from '@/services/useNotificationService';
import { BellIcon, CoinIcon, UpgradeIcon } from '../icons';

type Notification = {
  id: string | number;
  title?: string;
  message?: string;
  body?: string;
  created_at?: string;
  read?: boolean;
};

export const NavBar = (props: { className?: string }) => {
  const { isAuthenticated, isPremium, authLoading, user } = useAuth();
  const { getUnreadCount, getNotifications } = useNotificationService();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    getUnreadCount().then((res) => {
      const count = res?.content?.count ?? res?.count ?? res?.content?.unread_count ?? 0;
      setUnreadCount(Number(count));
    }).catch(() => {});
  }, [isAuthenticated]);

  return (
    <div className={props.className}>
      <div className="flex h-15 w-full items-center justify-between px-4 sm:px-6 md:h-25 md:px-8 ">
        <Link href="/" className="relative h-full w-15 md:w-25.5">
          <Image src="/General/Unscripti-logo.png" fill alt="Unscripti Logo" sizes="102px" loading="eager" className="h-full object-contain mix-blend-luminosity" />
        </Link>
        {authLoading && (
          <div className="flex gap-3 md:mr-21">
            <div className="h-9 w-20 animate-pulse rounded-lg bg-black-60" />
            <div className="hidden h-9 w-20 animate-pulse rounded-lg bg-black-60 sm:block" />
          </div>
        )}
        {!authLoading && !isAuthenticated && (
          <div className="flex gap-3 md:mr-21">
            <Link href="/sign-in" className="cursor-pointer rounded-lg border border-primary-100 px-6 py-2 text-sm font-semibold text-primary-100 transition-opacity hover:opacity-80">Log In</Link>
            <Link href="/sign-up" className="hidden cursor-pointer rounded-lg border border-primary-100 bg-primary-100 px-6 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80 sm:block">Sign up</Link>
          </div>
        )}
        {!authLoading && isAuthenticated && (
          <div className="flex h-fit items-center gap-2 sm:gap-6">
            <div className="flex cursor-pointer items-center justify-center gap-1 rounded-md bg-black-60 px-3 py-2 font-semibold hover:bg-black-40">
              <CoinIcon />
              <span className="text-xs whitespace-nowrap text-white">
                {user?.coin_balance ?? 0}
                {' '}
                Coins
              </span>
            </div>
            {!isPremium && (
              <button
                className="hidden cursor-pointer items-center gap-3 rounded-xl bg-gradient-to-r from-premium-100 to-primary-200 px-3 py-2 text-xs font-semibold text-white sm:flex"
              >
                <UpgradeIcon />
                <span>Upgrade</span>
              </button>
            )}
            <div className="relative">
              <button
                onClick={() => {
                  const next = !notifOpen;
                  setNotifOpen(next);
                  if (next && notifications.length === 0) {
                    setNotifLoading(true);
                    getNotifications().then((res) => {
                      const items = res?.content?.notifications ?? res?.content?.items ?? res?.content ?? res?.data ?? [];
                      setNotifications(Array.isArray(items) ? items as Notification[] : []);
                    }).catch(() => {}).finally(() => setNotifLoading(false));
                  }
                }}
                className="relative flex cursor-pointer items-center justify-center [&>svg]:pointer-events-none"
              >
                <BellIcon />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <>
                  <button
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setNotifOpen(false)}
                    aria-label="Close notifications"
                  />
                  <div className="absolute top-8 right-0 z-50 w-72 rounded-xl border border-black-40 bg-black-100 py-2 shadow-lg">
                    <p className="px-4 pb-2 text-xs font-semibold text-white-50">Notifications</p>
                    {notifLoading && (
                      <p className="px-4 py-3 text-sm text-white-50">Loading…</p>
                    )}
                    {!notifLoading && notifications.length === 0 && (
                      <p className="px-4 py-3 text-sm text-white-50">No notifications to show.</p>
                    )}
                    {!notifLoading && notifications.map(n => (
                      <div key={n.id} className="flex flex-col gap-0.5 border-t border-black-40 px-4 py-3">
                        {(n.title) && (
                          <span className="text-xs font-semibold text-white">{n.title}</span>
                        )}
                        <span className="text-xs text-white-75">{n.message ?? n.body ?? ''}</span>
                        {n.created_at && (
                          <span className="text-[10px] text-white-50">{new Date(n.created_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
