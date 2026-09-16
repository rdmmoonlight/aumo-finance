import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  srcDir: 'src',
  
  css: [resolve(__dirname, './src/app/assets/css/main.css')],

  alias: {
    '@': resolve(__dirname, './src/app'),
    '~': resolve(__dirname, './src/app')
  },

  modules: [
    '@nuxt/eslint',
    '@nuxt/icon',
    'shadcn-nuxt'
  ],

  vite: {
    resolve: {
      tsconfigPaths: true
    },
    plugins: [
      tailwindcss()
    ],
  },

  shadcn: {
    prefix: '',
    componentDir: './src/app/components/ui'
  }
})
