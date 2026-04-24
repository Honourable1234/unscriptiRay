'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AddIcon, ChevronDownIcon, GroupIcon, NewChatIcon, OpenIcon } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { api } from '@/libs/api';

type ChatView = 'chat' | 'group' | 'scenario';

type NavItem = {
  label: string;
  icon: React.ReactNode;
  view: ChatView;
};

type ChatRoom = {
  id: string;
  title: string;
  character: { id: string; name: string; image_url: string };
};

const navItems: NavItem[] = [
  { label: 'New Chat', icon: <NewChatIcon />, view: 'chat' },
  { label: 'New Group', icon: <GroupIcon />, view: 'group' },
  { label: 'New Scenario', icon: <AddIcon />, view: 'scenario' },
];

const ChatHistoryList = (props: { onSelect: () => void }) => {
  const { token } = useAuth();
  const { chatListVersion, setActiveChat, setMessages, setNextCursor, setHasMoreMessages } = useChat();
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }
    api.get('/chat/list?page=1', token).then((res) => {
      const items = res?.content?.items;
      const pagination = res?.content?.pagination;
      if (Array.isArray(items)) {
        setRooms(items as ChatRoom[]);
      }
      if (pagination) {
        setPages((pagination.pages as number) ?? 1);
      }
    });
  }, [token, chatListVersion]);

  const loadMore = () => {
    if (!token) {
      return;
    }
    const nextPage = page + 1;
    setLoadingMore(true);
    api.get(`/chat/list?page=${nextPage}`, token).then((res) => {
      const items = res?.content?.items;
      if (Array.isArray(items)) {
        setRooms(prev => [...prev, ...(items as ChatRoom[])]);
        setPage(nextPage);
      }
    }).finally(() => setLoadingMore(false));
  };

  if (rooms.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={() => setOpen(prev => !prev)}
        className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1 text-xs font-semibold text-white-75 hover:text-white"
      >
        <span>
          Your Chats (
          {rooms.length}
          )
        </span>
        <span className={`transition-transform duration-200 ${open ? 'rotate-0' : '-rotate-90'}`}>
          <ChevronDownIcon />
        </span>
      </button>

      {open && (
        <>
          {rooms.map(room => (
            <button
              key={room.id}
              onClick={() => {
                setActiveChat({
                  chatroomId: room.id,
                  characterId: room.character.id,
                  name: room.character.name,
                  image: room.character.image_url,
                  greetingMessage: '',
                });
                setMessages([]);
                api.get(`/chat/${room.id}/messages`, token ?? undefined).then((res) => {
                  const items = res?.content?.messages ?? res?.messages ?? res?.content?.items ?? res?.content ?? res?.data;
                  if (Array.isArray(items)) {
                    setMessages([...(items as Record<string, unknown>[])].reverse().map((m, i) => {
                      const ts = m.timestamp ? new Date(m.timestamp as number) : null;
                      return {
                        id: i,
                        text: (m.text ?? m.content ?? m.message) as string | undefined,
                        sender: m.sender_type === 'user' ? 'user' as const : 'character' as const,
                        time: ts ? ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                        date: ts ? (ts.toDateString() === new Date().toDateString() ? 'Today' : ts.toLocaleDateString([], { month: 'short', day: 'numeric' })) : 'Today',
                      };
                    }));
                    setNextCursor((res?.content?.nextCursor as string) ?? null);
                    setHasMoreMessages(!!(res?.content?.nextCursor));
                  }
                });
                router.push('/chat');
                props.onSelect();
              }}
              className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-2 text-left text-white hover:bg-black-40"
            >
              <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full">
                {room.character.image_url && (
                  <Image src={room.character.image_url} alt={room.character.name} fill sizes="32px" className="object-cover" />
                )}
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-xs font-medium text-white">{room.title || room.character.name}</span>
              </div>
            </button>
          ))}

          {page < pages && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="mt-1 cursor-pointer rounded-lg px-2 py-1.5 text-xs text-white-75 hover:text-white disabled:opacity-50"
            >
              {loadingMore ? 'Loading...' : 'Load more'}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export const ChatSideBar = () => {
  const { activeView, setActiveView, activeChat, setActiveChat } = useChat();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile: slide-in drawer */}
      <div className="sm:hidden">
        <button
          onClick={() => setMobileOpen(prev => !prev)}
          className="fixed top-4 left-4 z-50 cursor-pointer rounded-lg bg-black-100/40 p-2 text-white/40 hover:text-white-75"
        >
          <OpenIcon />
        </button>

        {mobileOpen && (
          <button
            type="button"
            aria-label="Close sidebar"
            className="fixed inset-0 z-40 cursor-default bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <div className={`fixed top-0 left-0 z-50 flex h-full w-72 flex-col overflow-y-auto bg-black-100 px-4 py-5 transition-transform duration-300 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <button
            onClick={() => setMobileOpen(false)}
            className="mb-6 flex w-fit cursor-pointer items-center justify-center rounded-lg p-2 text-white hover:bg-black-40"
          >
            <OpenIcon />
          </button>

          <nav className="flex flex-col gap-3">
            {navItems.map(item => (
              <button
                key={item.view}
                onClick={() => {
                  setActiveView(item.view);
                  setActiveChat(null);
                  setMobileOpen(false);
                  router.push('/chat');
                }}
                className={`flex cursor-pointer items-center gap-3 rounded-xl p-3 text-sm font-medium transition-colors ${!activeChat && activeView === item.view ? 'bg-success-100/20 text-success-100' : 'text-white hover:bg-black-40 hover:text-white/75'}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-4 flex flex-col gap-3 border-t border-black-40 pt-4">
            <ChatHistoryList onSelect={() => setMobileOpen(false)} />
          </div>
        </div>
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
                onClick={() => {
                  setActiveView(item.view);
                  setActiveChat(null);
                  router.push('/chat');
                }}
                className={`flex cursor-pointer items-center gap-3 rounded-xl p-3 text-sm font-medium transition-colors ${!activeChat && activeView === item.view ? 'bg-success-100/20 text-success-100' : 'text-white hover:bg-black-40 hover:text-white/75'}`}
              >
                {item.icon}
                {isOpen && <span>{item.label}</span>}
              </button>
            ))}
          </nav>

          {isOpen && (
            <div className="mt-4 flex flex-col gap-3 border-t border-black-40 pt-4">
              <ChatHistoryList onSelect={() => {}} />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
