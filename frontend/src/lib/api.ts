// src/lib/api.ts

// Kosongkan DEFAULT_BACKEND_URL agar request menggunakan Relative Path ('')
// Ini memastikan request selalu melalui Reverse Proxy (Nginx di Render / Vite Proxy di lokal)
export const DEFAULT_BACKEND_URL = ''

export function getBackendTarget(): string {
  // Base URL backend. Jika VITE_API_BASE_URL diisi, pakai nilainya.
  // Jika tidak diisi, gunakan relative path ''
  const target = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_BACKEND_URL
  return String(target).replace(/\/+$/, '')
}

export const API_BASE_URL = getBackendTarget()
export const getApiBaseUrl = getBackendTarget

// Tag yang dulu ada di createApi, dipertahankan untuk invalidasi manual
export const TAG_TYPES = [
  'Auth',
  'ChartOfAccounts',
  'Journals',
  'JournalEntry',
  'Periods',
  'Dashboard',
  'Reports',
  'Settings',
  'Tools',
  'Notifications',
  'Summary',
  'FinancialStatements',
  'GeneralLedgers',
  'Worksheet',
  'MarketData',
  'AumoBackend',
  'Health',
] as const

export type ApiTag = (typeof TAG_TYPES)[number]

let isRedirecting = false

export function resetRedirectFlag() {
  isRedirecting = false
}

export interface ApiError {
  status: number
  data?: unknown
  message?: string
}

export interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  params?: Record<string, string | number | boolean | undefined>
}

function buildUrl(url: string, params?: ApiFetchOptions['params']) {
  const target = getBackendTarget()
  // Hasilnya akan menjadi '/api/v1/auth/login' (relative path ke Nginx / Vite proxy)
  const full = `${target}/api/v1${url}`
  if (!params) return full

  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `${full}?${query}` : full
}

export async function apiFetch<T>(url: string, options: ApiFetchOptions = {}): Promise<T> {
  // Aturan yang sama dengan versi asli: jalur wajib diawali /
  if (!url || !url.startsWith('/')) {
    throw new Error(`[API Route Error]: Route "${url}" wajib diawali dengan slash '/'.`)
  }

  const { body, params, headers, ...rest } = options
  const method = (rest.method || 'GET').toUpperCase()

  const fetchHeaders = new Headers(headers as HeadersInit | undefined)

  let fetchBody: BodyInit | undefined
  if (body instanceof FormData) {
    // Jika body FormData, hapus header Content-Type
    // biar browser yang set boundary-nya
    fetchHeaders.delete('Content-Type')
    fetchHeaders.delete('content-type')
    fetchBody = body
  } else if (body !== undefined && body !== null) {
    if (!fetchHeaders.has('Content-Type')) {
      fetchHeaders.set('Content-Type', 'application/json')
    }
    fetchBody = typeof body === 'string' ? body : JSON.stringify(body)
  }

  const response = await fetch(buildUrl(url, params), {
    ...rest,
    method,
    headers: fetchHeaders,
    body: fetchBody,
    credentials: 'include',
  })

  if (!response.ok) {
    let errorData: unknown
    try {
      errorData = await response.json()
    } catch {
      errorData = undefined
    }

    const error: ApiError = {
      status: response.status,
      data: errorData,
      message:
        typeof errorData === 'object' &&
        errorData !== null &&
        'message' in errorData &&
        typeof errorData.message === 'string'
          ? errorData.message
          : response.statusText,
    }

    console.warn(`⚠ [API ${response.status}]: ${method} ${url}`, error)

    // Status 401 di luar / dan /auth* -> alihkan ke login satu kali
    if (response.status === 401 && typeof window !== 'undefined' && !isRedirecting) {
      const currentPath = window.location.pathname
      const isPublicPath = currentPath === '/' || currentPath.startsWith('/auth')

      if (!isPublicPath) {
        isRedirecting = true
        window.location.replace(`/auth/login?redirect=${encodeURIComponent(currentPath)}`)
      }
    }

    throw error
  }

  if (response.status === 204) return null as T

  const contentType = response.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    return (await response.json()) as T
  }
  return (await response.text()) as T
}

// Helper ringkas
export const api = {
  get: <T>(url: string, options?: ApiFetchOptions) =>
    apiFetch<T>(url, { ...options, method: 'GET' }),
  post: <T>(url: string, body?: unknown, options?: ApiFetchOptions) =>
    apiFetch<T>(url, { ...options, method: 'POST', body }),
  put: <T>(url: string, body?: unknown, options?: ApiFetchOptions) =>
    apiFetch<T>(url, { ...options, method: 'PUT', body }),
  patch: <T>(url: string, body?: unknown, options?: ApiFetchOptions) =>
    apiFetch<T>(url, { ...options, method: 'PATCH', body }),
  delete: <T>(url: string, options?: ApiFetchOptions) =>
    apiFetch<T>(url, { ...options, method: 'DELETE' }),
}

export const baseApi = {
  fetch: apiFetch,
  util: {
    resetApiState: () => {
      resetRedirectFlag()
    },
    invalidateTags: (_tags: ApiTag[]) => {},
  },
}

export default api
