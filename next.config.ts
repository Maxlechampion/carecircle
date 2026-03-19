import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel handles output automatically — do NOT use 'standalone' on Vercel
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.googleusercontent.com' },
      { protocol: 'https', hostname: '**.githubusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
  // Needed for Prisma on Vercel
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
};

export default nextConfig;
