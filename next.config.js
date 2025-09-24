/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["placeholder.svg"],
    unoptimized: true,
  },

  compiler: {
    // remove all console.* in production builds
    removeConsole: process.env.NODE_ENV === 'production',
    // or keep important ones:
    // removeConsole: { exclude: ['error', 'warn'] }
  },
}

module.exports = nextConfig
