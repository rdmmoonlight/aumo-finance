import aumoConfig from './aumo.config.ts'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Aktifkan pemeriksaan TypeScript saat build
  typescript: {
    ignoreBuildErrors: false,
  },
  // Aktifkan pemeriksaan ESLint saat build
  eslint: {
    ignoreDuringBuilds: false,
  },
  env: {
    WEB_API_URL: aumoConfig.backendTarget,
  },
  async rewrites() {
    return aumoConfig.getRewrites()
  },
}

export default nextConfig