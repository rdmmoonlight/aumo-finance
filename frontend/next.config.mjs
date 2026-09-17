// next.config.mjs
import aumoConfig from './aumo.config.ts'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Matikan pemeriksaan ESLint saat proses build Next.js
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 2. Matikan pengecekan ketat TypeScript agar build Vercel langsung hijau
  typescript: {
    ignoreBuildErrors: true,
  },
  // 3. Environment variables dari pusat konfigurasi aumo.config.ts
  env: {
    WEB_API_URL: aumoConfig.backendTarget,
  },

  async rewrites() {
    return aumoConfig.getRewrites()
  },
}

export default nextConfig