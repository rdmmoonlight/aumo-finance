// src/lib/api.ts

export function getBackendTarget(): string {
    // Di client pakai proxy /api/v1 -> biar lewat rewrite
    if (typeof window !== 'undefined') {
        return ''
    }

    const target =
        import.meta.env.INTERNAL_API_URL ||
        import.meta.env.BACKEND_URL ||
        import.meta.env.WEB_API_URL ||
        'http://127.0.0.1:5000'

    return target.replace(/\/+$/, '')
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
    const full = `${getBackendTarget()}/api/v1${url}`
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
        throw new Error(
            `[API Route Error]: Route "${url}" wajib diawali dengan slash '/'.`,
        )
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
            message: (errorData as any)?.message || response.statusText,
        }

        console.warn(`⚠ [API ${response.status}]: ${method} ${url}`, error)

        // Status 401 di luar / dan /auth* -> alihkan ke login satu kali
        if (
            response.status === 401 &&
            typeof window !== 'undefined' &&
            !isRedirecting
        ) {
            const currentPath = window.location.pathname
            const isPublicPath = currentPath === '/' || currentPath.startsWith('/auth')

            if (!isPublicPath) {
                isRedirecting = true
                window.location.replace(
                    `/auth/login?redirectTo=${encodeURIComponent(currentPath)}`,
                )
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

// Helper ringkas, pengganti baseApi endpoint
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

// Kompatibilitas dengan pemakaian lama di AppSidebar:
// store.dispatch(baseApi.util.resetApiState())
// Di Vue tidak ada Redux store, reset di sini cukup reset flag redirect
// dan bisa dipakai untuk clear cache manual di feature api.
export const baseApi = {
    fetch: apiFetch,
    util: {
        resetApiState: () => {
            resetRedirectFlag()
        },
        invalidateTags: (_tags: ApiTag[]) => {
            // No-op: tidak ada cache RTK di Vue.
            // Feature api bisa panggil refetch manual setelah mutasi.
        },
    },
}

export default api