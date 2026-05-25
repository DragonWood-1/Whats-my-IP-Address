/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  productionBrowserSourceMaps: false,
  typescript: { ignoreBuildErrors: true },
  experimental: { webpackMemoryOptimizations: true },
};

module.exports = nextConfig;
