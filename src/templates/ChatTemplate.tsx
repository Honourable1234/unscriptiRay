'use client';

import { ChatSideBar } from '@/components/chat/ChatSideBar';
import { NavBar } from '@/components/dashboard/NavBar';
import { SideBar } from '@/components/dashboard/SideBar';
import { StackedCoinIcon } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import { useChatNavigation } from '@/context/ChatContext';
import { Link } from '@/libs/I18nNavigation';

const ChatGuestBanner = () => {
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-black-40 bg-black-100 px-4 py-2.5 sm:px-6 md:px-8">
      <div className="flex items-center gap-2 rounded-full bg-black-60 py-1.5 pr-1.5 pl-3 text-xs font-medium text-white">
        <span className="flex items-center gap-1.5">
          <StackedCoinIcon />
          4 dreamcoins left
        </span>
        <span className="hidden text-white-75 sm:inline">+50 on signup</span>
        <Link
          href="/sign-up"
          className="cursor-pointer rounded-full bg-gradient-to-r from-premium-100 to-primary-200 px-3 py-1 font-semibold text-white transition-opacity hover:opacity-80"
        >
          Sign up free
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/sign-in" className="cursor-pointer text-xs font-semibold text-white hover:text-white/75">Login</Link>
        <Link href="/sign-up" className="cursor-pointer rounded-full bg-primary-100 px-4 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-80">Join Free</Link>
      </div>
    </div>
  );
};

export const ChatTemplate = (props: { children: React.ReactNode }) => {
  const { activeChat } = useChatNavigation();
  const { isAuthenticated, authLoading } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-black-80">
      <SideBar />
      <ChatSideBar />
      <div className={`flex w-full flex-col overflow-hidden ${activeChat ? 'bg-black-100' : ''}`}>
        {authLoading || isAuthenticated
          ? <NavBar className={activeChat ? 'bg-black-100' : undefined} />
          : <ChatGuestBanner />}
        <div className={`flex-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${activeChat ? 'overflow-hidden' : 'overflow-y-auto px-4 sm:px-6 md:px-8'}`}>
          {props.children}
        </div>
      </div>
    </div>
  );
};
