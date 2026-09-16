import aumoConfig from './aumo.config.ts'

const nextConfig = {
  env: {
    WEB_API_URL: aumoConfig.backendTarget,
  },
  async rewrites() {
    return aumoConfig.getRewrites()
  },
}

export default nextConfig
