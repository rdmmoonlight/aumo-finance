import {
  createRootRoute,
  Outlet,
  Link,
  HeadContent,
  Scripts,
  redirect,
} from '@tanstack/react-router'
import appCss from '../styles/index.css?url'
import apiClient from '@/lib/apiClient'

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
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="antialiased bg-background text-foreground">
        <Outlet />
        <Scripts />
      </body>
    </html>
  )
}

export const Route = createRootRoute({
  // Pengecekan auth dijalankan di beforeLoad sebelum UI di-render
  beforeLoad: async ({ location }) => {
    const isAuthPage =
      location.pathname.startsWith('/auth') ||
      location.pathname.startsWith('/login')

    // Jalankan eksekusi API hanya di browser client agar SSR di Vercel tidak crash 500
    if (typeof window !== 'undefined') {
      try {
        await apiClient.get('/api/v1/auth/me')

        // Jika user sudah login tapi mencoba buka halaman /auth, lempar balik ke /homepage
        if (isAuthPage) {
          throw redirect({ to: '/homepage' })
        }
      } catch (err) {
        // Jika belum login dan bukan di halaman auth, lempar ke /auth
        if (!isAuthPage) {
          throw redirect({ to: '/auth' })
        }
      }
    }
  },

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