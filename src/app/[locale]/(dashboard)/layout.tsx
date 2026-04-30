import { setRequestLocale } from 'next-intl/server';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AuthProvider } from '@/context/AuthContext';
import { DashboardTemplate } from '@/templates/DashboardTemplate';

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <AuthProvider>
      <DashboardTemplate>
        <AuthGuard>
          {props.children}
        </AuthGuard>
      </DashboardTemplate>
    </AuthProvider>
  );
}
