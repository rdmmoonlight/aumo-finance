import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import fs from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = (
    env.VITE_API_BASE_URL ||
    env.PUBLIC_API_BASE_URL ||
    'https://aumoweb.onrender.com'
  ).replace(/\/+$/, '')

  return {
    plugins: [
      vue({
        script: {
          fs: {
            fileExists: fs.existsSync,
            readFile: (file: string) => fs.readFileSync(file, 'utf-8'),
          },
          globalTypeFiles: [],
        },
      }),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '#': fileURLToPath(new URL('./src', import.meta.url)),
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      outDir: 'dist',
    },
    server: {
      port: 5174,
      open: true,
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
