/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@yeshe/ui', '@yeshe/db', '@yeshe/auth', '@yeshe/payments'],
};

export default nextConfig;
