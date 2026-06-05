import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },
  serverExternalPackages: ['bcryptjs'],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
