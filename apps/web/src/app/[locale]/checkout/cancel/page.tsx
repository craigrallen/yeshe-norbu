import Link from 'next/link';

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-[#F9F7F4] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-6">↩️</div>
        <h1 className="text-2xl font-bold text-[#2C2C2C] mb-3">Betalningen avbröts</h1>
        <p className="text-gray-500 mb-8">Ingen betalning genomfördes. Du kan försöka igen.</p>
        <Link
          href="/sv"
          className="bg-[#2C2C2C] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#3a3a3a] transition-colors"
        >
          Tillbaka
        </Link>
      </div>
    </div>
  );
}
