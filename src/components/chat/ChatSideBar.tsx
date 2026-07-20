'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { AddIcon, GroupIcon, NewChatIcon, OpenIcon, SearchIcon } from '@/components/icons';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import { useChatMessages, useChatNavigation } from '@/context/ChatContext';
import { useChatService } from '@/services/useChatService';

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

const ChatSideBarTrigger = (props: { className?: string }) => {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      onClick={toggleSidebar}
      className={`flex w-fit cursor-pointer items-center justify-center rounded-lg p-2 text-white hover:bg-black-40 hover:text-white/75 ${props.className ?? ''}`}
    >
      <OpenIcon />
    </button>
  );
};

const ChatHistoryList = (props: { search: string; onSelect: () => void }) => {
  const t = useTranslations('ChatSideBar');
  const { token } = useAuth();
  const { chatListVersion, setActiveChat } = useChatNavigation();
  const { setMessages, setNextCursor, setHasMoreMessages, setIsTyping } = useChatMessages();
  const { getChatList, getMessages } = useChatService();
  const router = useRouter();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }
    getChatList(1).then((res) => {
      const items = res?.content?.items;
      const pagination = res?.content?.pagination;
      if (Array.isArray(items)) {
        setRooms(items as ChatRoom[]);
      }
      if (pagination) {
        setPages((pagination.pages as number) ?? 1);
      }
    }).catch(() => {});
  }, [token, chatListVersion]);

  const loadMore = () => {
    if (!token) {
      return;
    }
    const nextPage = page + 1;
    setLoadingMore(true);
    getChatList(nextPage).then((res) => {
      const items = res?.content?.items;
      if (Array.isArray(items)) {
        setRooms(prev => [...prev, ...(items as ChatRoom[])]);
        setPage(nextPage);
      }
    }).catch(() => {}).finally(() => setLoadingMore(false));
  };

  const visibleRooms = useMemo(() => {
    const query = props.search.trim().toLowerCase();
    if (!query) {
      return rooms;
    }
    return rooms.filter(room =>
      room.title?.toLowerCase().includes(query) || room.character.name.toLowerCase().includes(query));
  }, [rooms, props.search]);

  if (rooms.length === 0) {
    return null;
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <span className="flex h-8 items-center px-2 text-xs font-semibold text-white-75">
        {t('your_chats', { count: visibleRooms.length })}
      </span>

      <SidebarGroupContent>
        <SidebarMenu>
          {visibleRooms.map(room => (
            <SidebarMenuItem key={room.id}>
              <SidebarMenuButton
                onClick={() => {
                  setActiveChat({
                    chatroomId: room.id,
                    characterId: room.character.id,
                    name: room.character.name,
                    image: room.character.image_url,
                    greetingMessage: '',
                  });
                  setMessages([]);
                  setIsTyping(false);
                  getMessages(room.id).then((res) => {
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
                    router.push('/chat');
                    props.onSelect();
                  }).catch(() => {
                    router.push('/chat');
                    props.onSelect();
                  });
                }}
                className="h-auto py-2 text-white hover:bg-black-40"
              >
                <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full">
                  {room.character.image_url && (
                    <Image src={room.character.image_url} alt={room.character.name} fill sizes="32px" className="object-cover" />
                  )}
                </div>
                <span className="truncate text-xs font-medium text-white">{room.title || room.character.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}

          {page < pages && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="mt-1 cursor-pointer rounded-lg px-2 py-1.5 text-xs text-white-75 hover:text-white disabled:opacity-50"
            >
              {loadingMore ? t('loading_more') : t('load_more')}
            </button>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

const ChatSideBarContent = () => {
  const t = useTranslations('ChatSideBar');
  const { activeView, setActiveView, activeChat, setActiveChat } = useChatNavigation();
  const router = useRouter();
  const [search, setSearch] = useState('');

  const navItems: NavItem[] = [
    { label: t('new_chat'), icon: <NewChatIcon />, view: 'chat' },
    { label: t('new_group'), icon: <GroupIcon />, view: 'group' },
    { label: t('new_scenario'), icon: <AddIcon />, view: 'scenario' },
  ];

  return (
    <Sidebar collapsible="icon" className="border-black-40 bg-black-100">
      <ChatSideBarTrigger className="fixed top-4 left-16 z-50 bg-black-100/40 text-white/40 md:hidden" />

      <SidebarHeader className="gap-3 pt-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white group-data-[collapsible=icon]:hidden">Chats</span>
          <ChatSideBarTrigger className="hidden md:flex" />
        </div>

        <div className="relative group-data-[collapsible=icon]:hidden">
          <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 [&>svg]:h-4 [&>svg]:w-4">
            <SearchIcon />
          </span>
          <SidebarInput
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search chats..."
            className="h-9 rounded-lg border-black-40 bg-black-60 pl-8 text-white placeholder-white-75"
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-1">
            {navItems.map(item => (
              <SidebarMenuItem key={item.view}>
                <SidebarMenuButton
                  onClick={() => {
                    setActiveView(item.view);
                    setActiveChat(null);
                    router.push('/chat');
                  }}
                  isActive={!activeChat && activeView === item.view}
                  tooltip={item.label}
                  className="h-auto rounded-xl p-3 text-sm font-medium text-white hover:bg-black-40 hover:text-white/75 data-active:bg-success-100/20 data-active:text-success-100"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator className="bg-black-40" />

        <ChatHistoryList search={search} onSelect={() => {}} />
      </SidebarContent>
    </Sidebar>
  );
};

export const ChatSideBar = () => {
  return (
    // The transform makes this div the positioning container for the Sidebar's
    // fixed-position panel, so it docks to this column (right after the main
    // nav rail) instead of overlaying the viewport's left edge.
    <SidebarProvider className="h-screen min-h-0 w-fit transform-[translateZ(0)]">
      <ChatSideBarContent />
    </SidebarProvider>
  );
};
