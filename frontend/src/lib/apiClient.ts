import axios from 'axios'

// Tentukan Base URL secara aman antara Server & Client
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Di Browser/Client: Gunakan URL relatif agar kena proxy Next.js rewrites
    return process.env.NEXT_PUBLIC_WEB_API_URL || '/api'
  }
  // Di Server (Node.js/SSR): Gunakan URL backend absolut
  return process.env.WEB_API_URL || process.env.NEXT_PUBLIC_WEB_API_URL || 'http://localhost:3000/api'
}

export const apiClient = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request Interceptor: Oper Cookie dari Next.js Server ke Backend jika dipanggil dari SSR
apiClient.interceptors.request.use(async (config) => {
  // Mencegah penumpukan baseURL jika URL eksternal
  if (config.url?.startsWith('http')) {
    config.baseURL = ''
  }

  // Jika eksekusi terjadi di Sisi Server (SSR Node.js)
  if (typeof window === 'undefined') {
    try {
      const { cookies } = await import('next/headers')
      const cookieStore = await cookies()
      const cookieHeader = cookieStore.toString()

      if (cookieHeader) {
        config.headers.Cookie = cookieHeader
      }
    } catch {
      // Mengabaikan error jika dipanggil di luar konteks request Next.js
    }
  }

  return config
})

// Response Interceptor: Menangani Unauthenticated Request
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      const currentPath = window.location.pathname
      if (!currentPath.startsWith('/auth') && !currentPath.startsWith('/login')) {
        window.location.href = '/auth'
      }
    }
    return Promise.reject(err)
  }
)

export default apiClient
