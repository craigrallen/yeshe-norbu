import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Yeshe Norbu POS',
  description: 'Point of Sale — Yeshe Norbu',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body className="h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
