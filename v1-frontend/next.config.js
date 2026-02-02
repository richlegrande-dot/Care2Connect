/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [],
  },
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    // API proxy configuration
    // This eliminates CORS issues by making all API calls same-origin
    //
    // Backend route structure:
    // - /api/* → API routes with /api prefix
    // - /admin/* → Admin routes WITHOUT /api prefix  
    // - /health/* → Health routes WITHOUT /api prefix
    //
    // Frontend uses /api/* for everything, we rewrite to correct backend paths
    //
    // CRITICAL: Frontend code MUST use getApiUrl() from @/lib/api.ts
    // NEVER hardcode http://localhost:3001 in components
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    return [
      // Admin routes (backend has NO /api prefix)
      {
        source: '/api/admin/:path*',
        destination: `${backendUrl}/admin/:path*`,
      },
      // Health routes (backend has NO /api prefix)
      {
        source: '/api/health/:path*',
        destination: `${backendUrl}/health/:path*`,
      },
      // Regular API routes (backend HAS /api prefix)
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ]
  },
}

module.exports = nextConfig