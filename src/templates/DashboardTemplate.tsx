import { NavBar } from '@/components/dashboard/NavBar';
import { SideBar } from '@/components/dashboard/SideBar';

export const DashboardTemplate = (props: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-black-80">
      <aside className="h-screen flex-shrink-0">
        <SideBar />
      </aside>
      <div className="flex w-full flex-col overflow-hidden">
        <NavBar />
        <div className="flex-1 overflow-y-auto px-4 [scrollbar-width:none] sm:px-6 md:px-8 [&::-webkit-scrollbar]:hidden">
          {props.children}
        </div>
      </div>
    </div>
  );
};
