import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['http://192.168.68.103:3000'],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
