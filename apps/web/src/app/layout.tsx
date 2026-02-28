import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Yeshin Norbu',
  description: 'Buddhistiskt center i Stockholm',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
