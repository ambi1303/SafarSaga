/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['images.pexels.com'],
    unoptimized: false,
  },
  experimental: {
    optimizeCss: true,
  },
};

module.exports = nextConfig;
