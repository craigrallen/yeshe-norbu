import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@yeshe/ui', '@yeshe/db', '@yeshe/auth', '@yeshe/payments'],
};

export default nextConfig;
