import aumoConfig from './aumo.config.ts'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Abaikan folder src/pages dari pencarian rute Pages Router
  // Ini mencegah Next.js mengabaikan rute app/[[...slug]]/page.tsx
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/src/pages/**'],
    }
    return config
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    WEB_API_URL: aumoConfig.backendTarget,
  },
  async rewrites() {
    return aumoConfig.getRewrites()
  },
}

export default nextConfig
