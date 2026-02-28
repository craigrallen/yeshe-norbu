import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Yeshin Norbu POS',
  description: 'Point of Sale — Yeshin Norbu',
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
