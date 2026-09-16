import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  css: [resolve(__dirname, './app/assets/css/main.css')],

  alias: {
    '@': resolve(__dirname, './app'),
    '~': resolve(__dirname, './app')
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
    componentDir: './app/components/ui'
  }
})