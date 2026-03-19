import { setRequestLocale } from 'next-intl/server';
import { AuthTemplate } from '@/templates/AuthTemplate';

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <AuthTemplate>{props.children}</AuthTemplate>;
}
