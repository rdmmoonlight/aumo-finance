// next.config.mjs
import aumoConfig from './aumo.config.ts'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hanya kenali file di app/ yang memiliki akhiran .tsx/.ts standar,
  // sekaligus melewati otomatisasi Pages Router untuk folder src/pages/
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

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
