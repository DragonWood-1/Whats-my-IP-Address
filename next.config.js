/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  productionBrowserSourceMaps: false,
  typescript: { ignoreBuildErrors: true },
  experimental: { webpackMemoryOptimizations: true },
};

module.exports = nextConfig;
