// composables/useApi.ts
export const useApi = () => {
  const config = useRuntimeConfig()
  const reqHeaders = useRequestHeaders(['cookie'])

  const apiFetch = $fetch.create({
    // URL Backend Hono di Render
    baseURL:
      (config.public.apiBase as string) || 'https://aumohono.onrender.com',

    // WAJIB: Kirim cookie browser untuk CORS cross-domain
    credentials: 'include',

    onRequest({ options }) {
      // Buat instance Headers standard dari options.headers yang ada
      const headers = new Headers(options.headers)

      // 1. Wajib untuk Hono Dual-Auth Middleware
      headers.set('X-Client-Type', 'web')

      // 2. Teruskan Cookie browser saat SSR (Server-Side Rendering) ke server Render
      if (import.meta.server && reqHeaders.cookie) {
        headers.set('cookie', reqHeaders.cookie)
      }

      // Assign kembali sebagai Web Standard Headers Instance
      options.headers = headers
    },

    onResponseError({ response }) {
      console.error('[API Error]:', response.status, response._data)

      if (response.status === 401 && import.meta.client) {
        navigateTo('/login')
      }
    }
  })

  return apiFetch
}