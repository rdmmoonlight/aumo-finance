// composables/useApi.ts
export const useApi = () => {
  const config = useRuntimeConfig()
  const reqHeaders = useRequestHeaders(['cookie'])

  const apiFetch = $fetch.create({
    // Root URL Backend Hono di Render (Tanpa akhiran /api)
    baseURL:
      (config.public.apiBase as string) || 'https://aumohono.onrender.com',

    // WAJIB: Mengirimkan cookie HTTP-Only lintas domain (CORS)
    credentials: 'include',

    onRequest({ options }) {
      const headers = new Headers(options.headers)

      // 1. Wajib diset agar Hono mengenali request dari Web Client
      headers.set('X-Client-Type', 'web')

      // 2. Teruskan Cookie dari browser pengguna saat SSR ke server Render
      if (import.meta.server && reqHeaders.cookie) {
        headers.set('cookie', reqHeaders.cookie)
      }

      options.headers = headers
    },

    onResponseError({ response }) {
      console.error('[API Error]:', response.status, response._data)

      // Auto redirect ke login jika 401 Unauthorized di sisi client
      if (response.status === 401 && import.meta.client) {
        navigateTo('/login')
      }
    }
  })

  return apiFetch
}
