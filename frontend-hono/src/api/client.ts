// src/api/client.ts
const BASE_URL = import.meta.env.VITE_WEB_API_URL || '';

export interface ApiOptions extends Omit<RequestInit, 'body'> {
    body?: unknown;
}

/**
 * Fetch wrapper untuk API tanpa Redux.
 * @param endpoint Path endpoint API (misal: '/api/v1/periods')
 * @param options Opsi fetch tambahan; `body` objek otomatis di-JSON-kan, FormData dikirim apa adanya
 */
export async function apiClient<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { body, headers = {}, ...customConfig } = options;

    const requestHeaders: Record<string, string> = { ...(headers as Record<string, string>) };
    const config: RequestInit = {
        method: options.method || 'GET',
        credentials: 'include', // Mengirimkan cookie session / token
        headers: requestHeaders,
        ...customConfig,
    };

    if (body !== undefined && body !== null) {
        if (body instanceof FormData) {
            // Browser otomatis set multipart/form-data & boundary
            delete requestHeaders['Content-Type'];
            config.body = body;
        } else if (typeof body === 'object') {
            requestHeaders['Content-Type'] = 'application/json';
            config.body = JSON.stringify(body);
        } else {
            config.body = String(body);
        }
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    // Interceptor untuk Unauthenticated (401)
    if (response.status === 401) {
        if (typeof window !== 'undefined' && window.location.pathname !== '/auth') {
            window.location.href = '/auth';
        }
        throw new Error('Unauthorized');
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return (response.status === 204 ? null : await response.json()) as T;
}
