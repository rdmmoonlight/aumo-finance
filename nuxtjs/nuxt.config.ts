// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt',
    "@prisma/nuxt"
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Server-only: base URL of the AumoBackend ASP.NET Core API.
    // Nuxt's server routes proxy to this so the browser never talks to
    // the backend directly (avoids the cross-site Secure/SameSite=None
    // cookie problem and needs no backend CORS changes for this app).
    backendApiBase: 'https://aumonext-api.onrender.com'
  },

  routeRules: {
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