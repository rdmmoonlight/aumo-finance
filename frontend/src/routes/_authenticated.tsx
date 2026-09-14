// src/routes/_authenticated.tsx
import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import apiClient from '@/lib/apiClient'
import { IconLoader2 } from '@tabler/icons-react'
import Layout from '@/components/layout/AppLayout'

export const Route = createFileRoute('/_authenticated')({
  ssr: false, // Wajib diset false agar Layout Guard hanya diproses di Client Side
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    apiClient
      .get('/api/v1/auth/me')
      .then(() => {
        if (isMounted) setLoading(false)
      })
      .catch(() => {
        if (isMounted) {
          // Tendang paksa ke /auth tanpa memicu re-render tak terbatas
          navigate({ to: '/auth', replace: true })
        }
      })

    return () => {
      isMounted = false
    }
  }, [navigate])

  if (loading) {
    return (
      <div className="grid place-items-center h-screen w-full bg-background">
        <div className="flex flex-col items-center gap-2">
          <IconLoader2 className="animate-spin text-primary" size={32} />
          <span className="text-xs font-medium text-muted-foreground">
            Memeriksa autentikasi...
          </span>
        </div>
      </div>
    )
  }

  return <Outlet />
}
