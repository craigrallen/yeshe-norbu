'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function GlomdLosenordPage({ params: { locale } }: { params: { locale: string } }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const sv = locale === 'sv';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#F9F7F4] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🔑</div>
          <h1 className="text-3xl font-bold text-[#58595b]">{sv ? 'Glömt lösenord?' : 'Forgot password?'}</h1>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {sent ? (
            <div className="text-center">
              <div className="text-4xl mb-4">📧</div>
              <h2 className="text-xl font-semibold text-[#58595b] mb-3">{sv ? 'E-post skickad!' : 'Email sent!'}</h2>
              <p className="text-gray-500 mb-6">
                {sv
                  ? `Om det finns ett konto med ${email} har vi skickat en länk för att återställa ditt lösenord. Kolla din inkorg (och skräppost).`
                  : `If an account exists for ${email}, we've sent a password reset link. Check your inbox and spam folder.`}
              </p>
              <Link href={`/${locale}/logga-in`} className="text-[#f5ca00] font-medium hover:underline">
                {sv ? '← Tillbaka till inloggning' : '← Back to sign in'}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-gray-500 text-sm mb-4">
                {sv
                  ? 'Ange din e-postadress så skickar vi en länk för att återställa ditt lösenord. Fungerar även för gamla konton från yeshinnorbu.se.'
                  : 'Enter your email and we\'ll send a reset link. Also works for accounts from the old yeshinnorbu.se site.'}
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{sv ? 'E-postadress' : 'Email'}</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#f5ca00]"
                  placeholder="din@email.se" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-[#58595b] text-white font-semibold py-3.5 rounded-xl hover:bg-[#6b6c6e] disabled:opacity-50 transition-colors">
                {loading ? (sv ? 'Skickar...' : 'Sending...') : (sv ? 'Skicka återställningslänk' : 'Send reset link')}
              </button>
              <div className="text-center text-sm">
                <Link href={`/${locale}/logga-in`} className="text-[#f5ca00] hover:underline">
                  {sv ? '← Tillbaka' : '← Back'}
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
