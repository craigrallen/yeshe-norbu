import { Suspense } from 'react';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-[#F9F7F4] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-6"></div>
        <h1 className="text-3xl font-bold text-[#58595b] mb-3">Tack för din betalning!</h1>
        <p className="text-gray-600 mb-2">Din betalning har genomförts.</p>
        <p className="text-gray-500 text-sm mb-8">En bekräftelse skickas till din e-postadress.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/sv/events"
            className="bg-[#f5ca00] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#d4af00] transition-colors"
          >
            Se kommande evenemang
          </Link>
          <Link
            href="/sv"
            className="border border-gray-300 text-[#58595b] font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Tillbaka till startsidan
          </Link>
        </div>
      </div>
    </div>
  );
}
