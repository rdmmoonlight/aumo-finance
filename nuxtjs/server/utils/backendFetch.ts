import type { H3Event } from 'h3'

/**
 * Calls the AumoBackend ASP.NET Core API from the Nuxt server (Nitro),
 * acting as a same-origin BFF proxy for the browser.
 *
 * Why a proxy instead of calling the backend directly from the browser:
 * - The backend's auth cookie ("AumoFinance.Session") is issued with
 *   SameSite=None; Secure, meant for a *different* deployed frontend
 *   origin (Vercel) than this Nuxt app. Routing everything through
 *   Nuxt's own /api/** means the browser only ever talks to this app's
 *   own origin, so no backend CORS/cookie changes are needed for a
 *   first integration pass.
 * - It forwards the incoming request's cookies to the backend, and
 *   relays any Set-Cookie the backend returns back to the browser.
 */
export async function backendFetch<T = unknown>(
  event: H3Event,
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    body?: unknown
    query?: Record<string, unknown>
  } = {}
): Promise<T> {
  const config = useRuntimeConfig()
  const cookieHeader = getHeader(event, 'cookie')

  try {
    const response = await $fetch.raw<T>(path, {
      baseURL: config.backendApiBase,
      method: options.method ?? 'GET',
      body: options.body,
      query: options.query,
      headers: cookieHeader ? { cookie: cookieHeader } : undefined
    })

    // Relay any Set-Cookie header from the backend (e.g. on login) so the
    // browser stores the session cookie against THIS app's origin.
    const setCookie = response.headers.getSetCookie?.() ?? []
    for (const cookie of setCookie) {
      appendHeader(event, 'set-cookie', cookie)
    }

    return response._data as T
  } catch (error: any) {
    // Surface the backend's own status + body instead of a generic 500,
    // so pages/composables can branch on e.g. 401 the same way they
    // would against the backend directly.
    throw createError({
      statusCode: error?.response?.status ?? 502,
      statusMessage: error?.response?.statusText ?? 'Backend request failed',
      data: error?.response?._data
    })
  }
}
