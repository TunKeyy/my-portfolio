import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack config (used by `next dev --turbopack`)
  experimental: {
    turbo: {
      resolveAlias: {
        canvas: './empty-module.ts',
      },
    },
  },
  webpack: (config, { isServer }) => {
    // Handle canvas dependency for PDF libraries
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        encoding: false,
      };
    }
    
    // Handle PDF.js worker
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    
    return config;
  },
};

export default nextConfig;
