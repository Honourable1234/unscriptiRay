import { setRequestLocale } from 'next-intl/server';
import { DashboardTemplate } from '@/templates/DashboardTemplate';

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <DashboardTemplate isAuthenticated={true} isPremium={false}>
      {props.children}
    </DashboardTemplate>
  );
}
