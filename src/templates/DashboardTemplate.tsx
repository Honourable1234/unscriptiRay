import { NavBar } from '@/components/dashboard/NavBar';
import { SideBar } from '@/components/dashboard/SideBar';

export const DashboardTemplate = (props: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex min-h-screen bg-black-80">
      <aside>
        <SideBar />
      </aside>
      <div className="w-full">
        <NavBar isSignedIn isPremium />
        <div>
          {props.children}
        </div>
      </div>
    </div>
  );
};
