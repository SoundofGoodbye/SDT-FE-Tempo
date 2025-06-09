// delivery-system/apps/delivery-tracker/next.config.mjs
/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@delivery-system/ui-components',
    '@delivery-system/hooks',
    '@delivery-system/api-client',
    '@delivery-system/auth',
    '@delivery-system/state',
    '@delivery-system/types',
    '@delivery-system/utils',
    '@delivery-system/config'
  ],
  // Moved from experimental to top level
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'node_modules/@esbuild/linux-x64',
    ],
  },
  experimental: {
    // Removed outputFileTracingExcludes from here
  },
}

export default nextConfig