/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  experimental: {
    serverComponentsExternalPackages: [],
  },
  images: {
    domains: ['localhost', 'careconnect.vercel.app', 'careconnect.org', 'api.careconnect.org'],
    formats: ['image/webp', 'image/avif'],
  },
  headers: async () => {
    return [
      // All pages - standard security headers (applied first)
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-Care2-Origin',
            value: 'frontend',
          },
        ],
      },
      // Profile pages - enhanced privacy headers (applied AFTER general, overrides where needed)
      {
        source: '/profile/:path*',
        headers: [
          {
            key: 'Referrer-Policy',
            value: 'no-referrer', // Stricter for profile pages to prevent sessionId leakage
          },
          {
            key: 'Cache-Control',
            value: 'private, no-store, no-cache, must-revalidate', // Prevent caching of sensitive profile data
          },
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow', // Prevent search engine indexing
          },
        ],
      },
    ]
  },
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ]
  },
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Audio file handling
    config.module.rules.push({
      test: /\.(mp3|wav|ogg|m4a)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/audio/',
          outputPath: 'static/audio/',
        },
      },
    })

    return config
  },
}

module.exports = nextConfig