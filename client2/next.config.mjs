const backendUrl = process.env.INTERNAL_BACKEND_URL || 'http://localhost:5000';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  webpack: (config) => {
    config.cache = false;
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl}/api/v1/:path*`,
      },
      {
        source: '/health',
        destination: `${backendUrl}/health`,
      },
      {
        source: '/email-preview',
        destination: `${backendUrl}/email-preview`,
      },
      {
        source: '/test-api',
        destination: `${backendUrl}/test-api`,
      },
    ];
  },
};

export default nextConfig;
