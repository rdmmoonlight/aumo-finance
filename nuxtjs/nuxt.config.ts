// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt',
  ],

  // Konfigurasi Prisma Nuxt Module agar tidak menggantung/prompt saat CI/CD & Vercel
  prisma: {
    skipPrompts: true,
    autoSetupPrisma: false
  },

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  // Konfigurasi Nitro untuk Vercel
  nitro: {
    preset: 'vercel'
  },

  routeRules: {
    // Memberikan aturan header CORS untuk endpoint server API jika diperlukan
    '/api/**': {
      cors: true
    }
  },

  compatibilityDate: '2026-06-30',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
