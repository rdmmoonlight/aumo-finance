import path from 'node:path'

export const aumoConfig = {
  envPrefix: ['WEB_'],
  backendTarget: process.env.WEB_API_URL || 'http://localhost:5000',

  alias: {
    '@': path.resolve(process.cwd(), './src'),
  },

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
