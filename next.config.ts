import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack config
  turbopack: {
    resolveAlias: {
      canvas: './empty-module.ts',
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
  async headers() {
    // CSP backstop for the public knowledge viewer. 'unsafe-inline' on script-src is required by
    // Next's inline bootstrap without per-request nonces; a strict nonce-based policy (middleware)
    // is a recommended follow-up. Sanitization (write + render) remains the primary XSS defense.
    return [
      {
        source: '/second-brain',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' https: data:",
              "connect-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "frame-ancestors 'none'",
              "frame-src 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
