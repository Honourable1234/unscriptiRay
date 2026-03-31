'use client';

import Image from 'next/image';
import { useState } from 'react';
import { AddIcon, ChevronDownIcon, ChevronRightIcon, GroupIcon, NewChatIcon, OpenIcon } from '@/components/icons';
import { useChat } from '@/context/ChatContext';

type ChatView = 'chat' | 'group' | 'scenario';

type NavItem = {
  label: string;
  icon: React.ReactNode;
  view: ChatView;
};

type HistoryItem = {
  id: number;
  name: string;
  image: string;
  sub?: string;
};

type HistorySection = {
  label: string;
  items: HistoryItem[];
};

const navItems: NavItem[] = [
  { label: 'New Chat', icon: <NewChatIcon />, view: 'chat' },
  { label: 'New Group', icon: <GroupIcon />, view: 'group' },
  { label: 'New Scenario', icon: <AddIcon />, view: 'scenario' },
];

// TODO: replace with real data
const mockHistory: HistorySection[] = [
  {
    label: 'Your Chats',
    items: [
      { id: 1, name: 'Satoru Gojo', image: '/General/GojoSatoru.png' },
      { id: 2, name: 'Monkey D. Luffy', image: '/General/GojoSatoru2.png' },
    ],
  },
  {
    label: 'Your Groups',
    items: [
      { id: 3, name: 'MyGroup', image: '/General/GojoSatoru3.png', sub: '4 Members' },
      { id: 4, name: 'WarriorBoys', image: '/General/GojoSatoru4.png', sub: '8 Members' },
    ],
  },
  {
    label: 'Your Scenarios',
    items: [
      { id: 5, name: 'In a city under atta...', image: '/General/GojoSatoru2.png', sub: '3 Members' },
    ],
  },
];

const HistorySectionItem = (props: { section: HistorySection }) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={() => setOpen(prev => !prev)}
        className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1 text-xs font-semibold text-white-75 hover:text-white"
      >
        <span>
          {props.section.label}
          {' '}
          (
          {props.section.items.length}
          )
        </span>
        {open ? <ChevronDownIcon /> : <ChevronRightIcon />}
      </button>

      {open && props.section.items.map(item => (
        <button
          key={item.id}
          className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-2 text-left text-white hover:bg-black-40"
        >
          <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full">
            <Image src={item.image} alt={item.name} fill className="object-cover" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-xs font-medium text-white">{item.name}</span>
            {item.sub && <span className="text-[10px] text-white-75">{item.sub}</span>}
          </div>
        </button>
      ))}
    </div>
  );
};

export const ChatSideBar = () => {
  const { activeView, setActiveView } = useChat();
  const [isOpen, setIsOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const hasHistory = mockHistory.some(s => s.items.length > 0);

  return (
    <>
      {/* Mobile: floating bar at top */}
      <div className="sm:hidden">
        <button
          onClick={() => setMobileOpen(prev => !prev)}
          className="fixed top-4 left-4 z-50 cursor-pointer rounded-lg bg-black-100/40 p-2 text-white/40 hover:text-white-75"
        >
          <OpenIcon />
        </button>

        {mobileOpen && (
          <div className="fixed top-14 right-0 left-0 z-40 mx-4 flex items-center justify-around rounded-xl bg-black-100 px-4 py-2 shadow-lg">
            {navItems.map(item => (
              <button
                key={item.view}
                onClick={() => {
                  setActiveView(item.view);
                  setMobileOpen(false);
                }}
                className={`rounded-lg p-2.5 transition-colors ${activeView === item.view ? 'bg-success-100/20 text-success-100' : 'text-white hover:text-white-75'}`}
              >
                {item.icon}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop: vertical sidebar */}
      <aside className={`hidden flex-col bg-black-100 py-5 transition-all duration-300 sm:flex ${isOpen ? 'h-screen w-45 items-start overflow-y-auto px-3 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden' : 'h-fit w-16.5 items-center px-2'}`}>
        <div className="flex w-full flex-col gap-1">
          <button
            onClick={() => setIsOpen(prev => !prev)}
            className="mb-4 flex w-fit cursor-pointer items-center justify-center rounded-lg p-2 text-white hover:bg-black-40 hover:text-white/75"
          >
            <OpenIcon />
          </button>

          <nav className="flex w-full flex-col gap-3">
            {navItems.map(item => (
              <button
                key={item.view}
                onClick={() => setActiveView(item.view)}
                className={`flex cursor-pointer items-center gap-3 rounded-xl p-3 text-sm font-medium transition-colors ${activeView === item.view ? 'bg-success-100/20 text-success-100' : 'text-white hover:bg-black-40 hover:text-white/75'}`}
              >
                {item.icon}
                {isOpen && <span>{item.label}</span>}
              </button>
            ))}
          </nav>

          {isOpen && hasHistory && (
            <div className="mt-4 flex flex-col gap-3 border-t border-black-40 pt-4">
              {mockHistory.map(section => (
                <HistorySectionItem key={section.label} section={section} />
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
