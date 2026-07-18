'use client';
import { usePathname } from 'next/navigation';
import { BarsIcon, ChatIcon, CreateIcon, ExploreIcon, FeedIcon, GenerateIcon, MyAIIcon, UpgradeIcon } from '@/components/icons';
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
  const { isAuthenticated, isPremium } = useAuth();
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-black-40 bg-black-100">
      <SideBarTrigger className="fixed top-4 left-4 z-50 bg-black-100/40 text-white/40 md:hidden" />

      <SidebarHeader className="pt-5">
        <SideBarTrigger className="hidden md:flex" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="gap-3 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.includes(item.href));
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  render={<Link href={item.href} />}
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

      <SidebarFooter className="pb-5">
        {!isPremium && (
          isAuthenticated
            ? (
                <button className="mt-15 flex w-full cursor-pointer items-center gap-3 rounded-xl bg-gradient-to-r from-premium-100 to-primary-200 p-3 text-sm font-semibold text-white group-data-[collapsible=icon]:justify-center">
                  <UpgradeIcon />
                  <span className="group-data-[collapsible=icon]:hidden">Upgrade</span>
                </button>
              )
            : (
                <Link href="/sign-in" className="cursor-pointer rounded-lg border border-primary-100 px-6 py-2 text-center text-sm font-semibold text-primary-100 transition-opacity group-data-[collapsible=icon]:px-2 hover:opacity-80">
                  Sign In
                </Link>
              )
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
      <SideBarContent />
    </SidebarProvider>
  );
};
