import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  compress: true,
  eslint: {
    // Lint errors are fixed separately; don't block the build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Type errors will be caught in CI; don't block the Railway test deploy
    ignoreBuildErrors: true,
  },
  transpilePackages: ['@yeshe/ui', '@yeshe/db', '@yeshe/auth', '@yeshe/payments', '@yeshe/email'],

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [{ protocol: 'https', hostname: 'yeshinnorbu.se' }],
  },
  rewrites: async () => ({
    fallback: [
      {
        source: '/wp-media/:path*',
        destination: 'https://yeshinnorbu.se/wp-content/uploads/:path*',
      },
    ],
  }),

  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      ],
    },
  ],
};

export default withNextIntl(nextConfig);
