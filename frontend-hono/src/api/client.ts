// src/api/client.js
const BASE_URL = import.meta.env.VITE_WEB_API_URL || '';

/**
 * Custom Fetch Wrapper untuk API tanpa Redux
 * @param {string} endpoint - Path endpoint API (misal: '/api/periods')
 * @param {RequestInit & { body?: any }} [options] - Opsi fetch tambahan
 */
export async function apiClient(endpoint, options = {}) {
    const { body, headers = {}, ...customConfig } = options;

    const config = {
        method: options.method || 'GET',
        credentials: 'include', // Mengirimkan cookie session / token
        headers: { ...headers },
        ...customConfig,
    };

    if (body !== undefined && body !== null) {
        if (body instanceof FormData) {
            // Browser otomatis set multipart/form-data & boundary
            delete config.headers['Content-Type'];
            config.body = body;
        } else if (typeof body === 'object') {
            config.headers['Content-Type'] = 'application/json';
            config.body = JSON.stringify(body);
        } else {
            config.body = body;
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

    return response.status === 204 ? null : response.json();
}