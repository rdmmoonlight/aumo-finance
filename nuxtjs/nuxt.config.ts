// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@prisma/nuxt'
  ],
  ssr: false,

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Server-only: base URL of the AumoBackend ASP.NET Core API.
    // Nuxt's server routes proxy to this so the browser never talks to
    // the backend directly (avoids the cross-site Secure/SameSite=None
    // cookie problem and needs no backend CORS changes for this app).
    // NOTE: this key went missing from a prior edit, silently breaking
    // every /api/v1/** call (login, dashboard, settings) because
    // useRuntimeConfig().backendApiBase resolved to undefined at
    // runtime. Restored here - do not remove without replacing every
    // proxyToBackend() call site's baseURL source.
    backendApiBase: 'https://aumonext-api.onrender.com'
  },

  routeRules: {
    // Memberikan aturan header CORS untuk endpoint server API jika diperlukan
    '/api/**': {
      cors: true
    }
  },

  compatibilityDate: '2026-06-30',

  // Konfigurasi Nitro untuk Vercel
  nitro: {
    preset: 'vercel'
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  // Konfigurasi Prisma Nuxt Module agar tidak menggantung/prompt saat CI/CD & Vercel
  prisma: {
    skipPrompts: true,
    autoSetupPrisma: false
  }
})
