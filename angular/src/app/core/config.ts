/** Base URL backend (/hono). Atur lewat VITE_API_URL di .env */
export const API_URL: string = (
  import.meta.env['VITE_API_URL'] ?? 'http://localhost:5000'
).replace(/\/$/, '');
