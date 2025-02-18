import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ddragon.leagueoflegends.com'
      },
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com'
      }
    ],
  },
};

export default nextConfig;
