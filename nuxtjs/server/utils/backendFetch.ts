import type { H3Event } from 'h3'

/**
 * Proxies the current request to the AumoBackend ASP.NET Core API
 * (folder /backend — the single source of truth for every endpoint
 * shape/route used here) and relays the response back as-is.
 *
 * Why a proxy instead of calling the backend directly from the browser:
 * - The backend's auth cookie ("AumoFinance.Session") is Secure +
 *   SameSite=None, meant for the separately-deployed frontend origin.
 *   Routing everything through this Nuxt server means the browser only
 *   ever talks to this app's own origin, so no backend CORS/cookie
 *   changes are needed for this app, and pages can keep calling
 *   `$fetch('/api/v1/...')` with the exact same path the backend
 *   controller exposes.
 * - It forwards the incoming request's cookies to the backend, and
 *   relays any Set-Cookie the backend returns back to the browser
 *   (e.g. on login/logout).
 *
 * Used by the catch-all route server/api/v1/[...].ts — new backend
 * endpoints therefore need NO new proxy code here, they just work.
 */
export async function proxyToBackend(event: H3Event, backendPath: string) {
  const config = useRuntimeConfig()
  const method = (event.method || 'GET').toUpperCase()

  const cookieHeader = getHeader(event, 'cookie')
  const contentType = getHeader(event, 'content-type')
  const query = getQuery(event)

  // Read the raw bytes so JSON bodies, multipart/form-data (e.g. avatar
  // upload) and empty bodies (GET/DELETE) all pass through unchanged —
  // encoding: false keeps binary uploads intact.
  const body = method === 'GET' || method === 'HEAD'
    ? undefined
    : await readRawBody(event, false)

  try {
    const response = await $fetch.raw(backendPath, {
      baseURL: config.backendApiBase,
      method: method as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
      query,
      body,
      headers: {
        ...(cookieHeader ? { cookie: cookieHeader } : {}),
        ...(contentType ? { 'content-type': contentType } : {})
      }
    })

    const setCookie = response.headers.getSetCookie?.() ?? []
    for (const cookie of setCookie) {
      appendHeader(event, 'set-cookie', cookie)
    }

    setResponseStatus(event, response.status)
    return response._data
  } catch (error: unknown) {
    // Surface the backend's real status + body (e.g. 401, 429 lockout,
    // validation errors) instead of a generic 500.
    const fetchError = error as { response?: { status?: number, statusText?: string, _data?: unknown } }
    throw createError({
      statusCode: fetchError?.response?.status ?? 502,
      statusMessage: fetchError?.response?.statusText ?? 'Backend request failed',
      data: fetchError?.response?._data
    })
  }
}
