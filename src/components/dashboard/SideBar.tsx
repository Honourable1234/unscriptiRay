'use client';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { BarsIcon, ChatIcon, CreateIcon, ExploreIcon, FeedIcon, GenerateIcon, MyAIIcon, SignOutIcon, UpgradeIcon } from '@/components/icons';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import { Link } from '@/libs/I18nNavigation';
import { supabase } from '@/libs/supabase';

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  { label: 'Create', href: '/create', icon: <CreateIcon /> },
  { label: 'Explore', href: '/', icon: <ExploreIcon /> },
  { label: 'Chat', href: '/chat', icon: <ChatIcon /> },
  { label: 'Generate', href: '/generate', icon: <GenerateIcon /> },
  { label: 'My AI', href: '/my-ai', icon: <MyAIIcon /> },
  { label: 'Feed', href: '/feed', icon: <FeedIcon /> },
];

const SideBarTrigger = (props: { className?: string }) => {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      onClick={toggleSidebar}
      className={`flex w-fit cursor-pointer items-center justify-center rounded-lg p-2 text-white hover:bg-black-40 hover:text-white/75 ${props.className ?? ''}`}
    >
      <BarsIcon />
    </button>
  );
};

const SideBarContent = () => {
  const { isAuthenticated, isPremium, user } = useAuth();
  const { setOpenMobile } = useSidebar();
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-black-40 bg-black-100">
      <SidebarHeader className="pt-5">
        <SideBarTrigger />
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="gap-3 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.includes(item.href));
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  render={<Link href={item.href} />}
                  onClick={() => setOpenMobile(false)}
                  isActive={isActive}
                  tooltip={item.label}
                  className="h-auto rounded-xl p-3 text-sm font-medium text-white hover:bg-black-40 hover:text-white/75 data-active:bg-primary-100/20 data-active:text-primary-100"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="gap-3 pb-5">
        {!isPremium && (
          isAuthenticated
            ? (
                <Link href="/profile/subscription" className="flex w-full cursor-pointer items-center gap-3 rounded-xl bg-gradient-to-r from-premium-100 to-primary-200 p-3 text-sm font-semibold text-white group-data-[collapsible=icon]:justify-center">
                  <UpgradeIcon />
                  <span className="group-data-[collapsible=icon]:hidden">Upgrade</span>
                </Link>
              )
            : (
                <Link href="/sign-in" className="cursor-pointer rounded-lg border border-primary-100 px-6 py-2 text-center text-sm font-semibold text-primary-100 transition-opacity group-data-[collapsible=icon]:px-2 hover:opacity-80">
                  Sign In
                </Link>
              )
        )}

        {isAuthenticated && (
          <>
            <Link
              href="/profile"
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl p-2 text-left group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-1 hover:bg-black-40"
            >
              <span className="relative h-8 w-8 flex-shrink-0">
                <Image src={user?.image_url ?? '/General/Profile.png'} alt="User Avatar" fill sizes="32px" className="rounded-full object-cover" />
              </span>
              <span className="min-w-0 group-data-[collapsible=icon]:hidden">
                <span className="block truncate text-sm font-semibold text-white">{user?.display_name ?? user?.username ?? 'Account'}</span>
                {user?.email && <span className="block truncate text-xs text-white-50">{user.email}</span>}
              </span>
            </Link>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => supabase.auth.signOut()}
                  tooltip="Sign Out"
                  className="h-auto rounded-xl p-3 text-sm font-medium text-white hover:bg-black-40 hover:text-white/75 [&>svg]:size-5"
                >
                  <SignOutIcon />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export const SideBar = () => {
  return (
    // The transform makes this div the positioning container for the Sidebar's
    // fixed-position panel, so it docks to this column instead of the viewport
    // edge — required when stacking more than one Sidebar side by side.
    <SidebarProvider className="h-screen min-h-0 w-fit transform-[translateZ(0)]">
      {/* The mobile panel is a sheet that only exists while it is open, so its
          trigger sits outside the sidebar to stay reachable. It floats in the
          gutter the templates reserve at the start of the top bar. */}
      <SideBarTrigger className="fixed top-3 left-2 z-40 md:hidden" />
      <SideBarContent />
    </SidebarProvider>
  );
};
