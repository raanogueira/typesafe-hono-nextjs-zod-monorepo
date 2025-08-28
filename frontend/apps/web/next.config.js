/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',

  // TypeScript project references support
  transpilePackages: ['@typesafe-stack/api-client'],

  // Experimental features for better monorepo support
  experimental: {
    // Support subpath imports in Next.js
    externalDir: true,
  },
}

export default nextConfig
