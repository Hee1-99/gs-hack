import type { NextConfig } from 'next';
const config: NextConfig = {
  poweredByHeader: false,
  distDir: '.firstday-build',
  turbopack: { root: process.cwd() },
  // The persistent compiler cache serializes environment inputs, including server secrets.
  experimental: { turbopackFileSystemCacheForBuild: false, turbopackFileSystemCacheForDev: false },
};
export default config;
