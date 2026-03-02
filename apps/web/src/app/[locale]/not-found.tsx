import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream dark:bg-[#1A1A1A] flex items-center justify-center px-4 pt-[72px]">
      <div className="text-center max-w-lg">
        <p className="text-7xl font-bold text-[#E8B817] mb-4">404</p>
        <h1 className="text-3xl font-bold text-charcoal dark:text-[#E8E4DE] mb-3">
          Sidan hittades inte / Page not found
        </h1>
        <p className="text-charcoal-light dark:text-[#A0A0A0] mb-8 leading-relaxed">
          Sidan du söker finns inte eller har flyttats.<br/>
          The page you are looking for does not exist or has moved.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/sv" className="px-5 py-2.5 bg-charcoal text-white rounded-lg text-sm font-medium hover:opacity-80 transition-opacity">
            Startsida / Home
          </Link>
          <Link href="/sv/events" className="px-5 py-2.5 border border-charcoal dark:border-[#E8E4DE] text-charcoal dark:text-[#E8E4DE] rounded-lg text-sm font-medium hover:bg-charcoal hover:text-white dark:hover:bg-[#E8E4DE] dark:hover:text-charcoal transition-colors">
            Evenemang / Events
          </Link>
          <Link href="/sv/kontakt" className="px-5 py-2.5 border border-charcoal dark:border-[#E8E4DE] text-charcoal dark:text-[#E8E4DE] rounded-lg text-sm font-medium hover:bg-charcoal hover:text-white dark:hover:bg-[#E8E4DE] dark:hover:text-charcoal transition-colors">
            Kontakt / Contact
          </Link>
        </div>
      </div>
    </div>
  );
}
