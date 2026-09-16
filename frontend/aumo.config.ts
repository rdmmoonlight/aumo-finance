import path from 'node:path'

export const aumoConfig = {
  // 1. Environment Prefix & Target Backend
  envPrefix: ['WEB_'],
  backendTarget: process.env.WEB_API_URL || 'http://localhost:5000',

  // 2. Path Alias Setup
  alias: {
    '@': path.resolve(process.cwd(), './src'),
  },

  // 3. Rules Rewrite / Proxy API
  getRewrites: () => {
    const target = process.env.WEB_API_URL || 'http://localhost:5000'
    return [
      {
        source: '/api/:path*',
        destination: `${target}/api/:path*`,
      },
    ]
  },
}

export default aumoConfig
