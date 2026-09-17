import axios from 'axios'

const baseURL = 
  process.env.WEB_API_URL || 
  process.env.NEXT_PUBLIC_WEB_API_URL || 
  '/api'

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  if (config.url?.startsWith('http')) {
    config.baseURL = ''
  }
  return config
})

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
