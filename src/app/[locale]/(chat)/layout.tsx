import { setRequestLocale } from 'next-intl/server';
import { PaymentRequiredPrompt } from '@/components/general/PaymentRequiredPrompt';
import { AuthProvider } from '@/context/AuthContext';
import { ChatProvider } from '@/context/ChatContext';
import { WalletProvider } from '@/context/WalletContext';
import { ChatTemplate } from '@/templates/ChatTemplate';

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <AuthProvider>
      <WalletProvider>
        <ChatProvider>
          <ChatTemplate>
            {props.children}
          </ChatTemplate>
        </ChatProvider>
        <PaymentRequiredPrompt />
      </WalletProvider>
    </AuthProvider>
  );
}
