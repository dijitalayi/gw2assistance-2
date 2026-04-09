import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/leyline-proxy/:path*',
        destination: 'https://auth-leyline.gw2.io/:path*',
      },
    ]
  },
};

export default nextConfig;

// Forced dev server restart to flush Tailwind compiler cache
