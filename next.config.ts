import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // This tells Next.js: "Don't use Vercel's server to resize. Just show the image."
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow images from Supabase/TMDB anywhere
      },
    ],
  },
};

export default nextConfig;