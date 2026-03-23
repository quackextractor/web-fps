/* global process, console */
import fs from 'fs';
import path from 'path';

let version = '0.0.0';
try {
  const versionPath = path.resolve(process.cwd(), '../version.md');
  if (fs.existsSync(versionPath)) {
    version = fs.readFileSync(versionPath, 'utf8').trim();
  } else {
    // Fallback: try to find it relative to current file if process.cwd() is different
    const altPath = path.resolve(import.meta.dirname || '.', '../version.md');
    if (fs.existsSync(altPath)) {
      version = fs.readFileSync(altPath, 'utf8').trim();
    }
  }
} catch (e) {
  console.warn('Could not read version.md', e);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_GAME_VERSION: version,
  },
  async headers() {
    const isDev = process.env.NODE_ENV !== 'production';
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "media-src 'self' data: blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            // Explicitly configuring Vercel's Edge CDN caching behavior
            value: 'public, max-age=31536000, immutable, s-maxage=31536000, stale-while-revalidate',
          },
        ],
      },
      {
        source: '/textures/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable, s-maxage=31536000, stale-while-revalidate',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, must-revalidate',
          },
        ],
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false,
  },

  // Enforce GZIP/Brotli compression for all responses
  compress: true,
}

export default nextConfig
