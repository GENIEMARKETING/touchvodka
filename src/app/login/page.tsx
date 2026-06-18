import AuthScreen from '@/components/AuthScreen';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Touch Vodka account.',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <AuthScreen mode="login" />;
}
