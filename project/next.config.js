/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly disable static export
  output: undefined,
  trailingSlash: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
    ],
  },
  // Optimize for production
  swcMinify: true,
  poweredByHeader: false,
  // Reduce bundle size
  experimental: {
    optimizeCss: true,
  },
};

module.exports = nextConfig;
