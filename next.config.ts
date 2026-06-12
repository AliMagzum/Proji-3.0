import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },
  serverExternalPackages: ['bcryptjs'],
};

export default nextConfig;
