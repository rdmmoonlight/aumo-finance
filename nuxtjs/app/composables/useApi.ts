// composables/useApi.ts
export const useApi = () => {
  const config = useRuntimeConfig()

  const apiFetch = $fetch.create({
    baseURL: config.public.apiBase as string,
    onRequest({ request, options }) {
      // Jika butuh kirim Header Authorization / Bearer Token dari Cookie/State:
      // const token = useCookie('auth_token')
      // if (token.value) {
      //   options.headers = { ...options.headers, Authorization: `Bearer ${token.value}` }
      // }
    },
    onResponseError({ response }) {
      console.error('API Error:', response._data)
    }
  })

  return apiFetch
}