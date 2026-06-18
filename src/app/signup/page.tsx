import AuthScreen from '@/components/AuthScreen';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create a Touch Vodka account and join the insiders.',
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return <AuthScreen mode="signup" />;
}
