import { useState, useEffect } from 'react'
import {
  createRootRoute,
  Outlet,
  useLocation,
  useNavigate,
  Link,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'
import appCss from '../styles/index.css?url'
import apiClient from '@/lib/apiClient'
import { IconLoader2 } from '@tabler/icons-react'

function NotFoundComponent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-sm text-muted-foreground">Halaman tidak ditemukan.</p>
      <Link to="/dashboard" className="text-xs underline text-primary">
        Kembali ke Dashboard
      </Link>
    </div>
  )
}

function RootComponent() {
  const location = useLocation()
  const navigate = useNavigate()
  
  // State auth: null (loading), true (login), false (unauthenticated)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  const isAuthPage = location.pathname.startsWith('/auth') || location.pathname.startsWith('/login')

  useEffect(() => {
    // 1. Jalankan autentikasi HANYA di Client Side (Browser)
    if (typeof window === 'undefined') return

    let isMounted = true

    async function checkAuth() {
      try {
        await apiClient.get('/api/v1/auth/me')
        if (isMounted) setIsAuthenticated(true)
      } catch (err) {
        if (isMounted) {
          setIsAuthenticated(false)
          // Tendang ke /auth hanya jika sedang tidak berada di halaman auth
          if (!isAuthPage) {
            navigate({ to: '/auth', replace: true })
          }
        }
      }
    }

    checkAuth()

    return () => {
      isMounted = false
    }
    // Dependency disederhanakan agar tidak memicu re-fetch loop
  }, [isAuthPage])

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="antialiased bg-background text-foreground">
        {/* Loading overlay tanpa merusak tag <html> */}
        {isAuthenticated === null && !isAuthPage ? (
          <div className="grid place-items-center h-screen w-full">
            <div className="flex flex-col items-center gap-2">
              <IconLoader2 className="animate-spin text-primary" size={32} />
              <span className="text-xs text-muted-foreground font-medium">
                Memeriksa autentikasi...
              </span>
            </div>
          </div>
        ) : (
          <Outlet />
        )}
        <Scripts />
      </body>
    </html>
  )
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Aumo Finance' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
})