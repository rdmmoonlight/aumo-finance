// src/routes/_authenticated.tsx
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import apiClient from '@/lib/apiClient'
import Layout from '@/components/layout/AppLayout'
import { IconLoader2 } from '@tabler/icons-react'

// 1. Komponen Animasi Loading
function AuthPendingComponent() {
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

export const Route = createFileRoute('/_authenticated')({
  // Pengecekan auth berjalan di async
  beforeLoad: async ({ location }) => {
    try {
      await apiClient.get('/api/v1/auth/me')
    } catch {
      throw redirect({
        to: '/auth',
        search: { redirect: location.href },
      })
    }
  },
  // 2. Pasang animasi loading di sini
  pendingComponent: AuthPendingComponent,
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
                                                        }
