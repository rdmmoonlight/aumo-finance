// src/routes/_authenticated.tsx
import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import apiClient from '@/lib/apiClient'
import { IconLoader2 } from '@tabler/icons-react'

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Jalankan cek auth HANYA di Browser Side
    if (typeof window === 'undefined') return

    let isMounted = true

    apiClient
      .get('/api/v1/auth/me')
      .then(() => {
        if (isMounted) setLoading(false)
      })
      .catch(() => {
        if (isMounted) {
          // Jika belum login, tendang paksa ke /auth
          navigate({ to: '/auth', replace: true })
        }
      })

    return () => {
      isMounted = false
    }
  }, [navigate])

  // Tampilkan loading screen sampai API /auth/me merespons
  if (loading) {
    return (
      <div className="grid place-items-center h-screen w-full bg-background">
        <div className="flex flex-col items-center gap-2">
          <IconLoader2 className="animate-spin text-primary" size={32} />
          <span className="text-xs text-muted-foreground font-medium">
            Memeriksa autentikasi...
          </span>
        </div>
      </div>
    )
  }

  // Jika sudah terautentikasi, render halaman yang dituju
  return <Outlet />
}