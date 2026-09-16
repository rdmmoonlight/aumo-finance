import aumoConfig from './aumo.config.ts'

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    WEB_API_URL: aumoConfig.backendTarget,
  },
  async rewrites() {
    return aumoConfig.getRewrites()
  },
}

export default nextConfig
