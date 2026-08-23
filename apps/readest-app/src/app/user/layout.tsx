import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Account & Sign In',
  description: 'Manage your account, subscription, cloud library storage, and account settings.',
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
