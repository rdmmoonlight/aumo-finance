import { createRootRoute, Outlet, Link } from '@tanstack/react-router'

function NotFoundComponent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-sm text-muted-foreground">Halaman tidak ditemukan.</p>
      <Link to="/auth" className="text-xs underline text-primary">
        Kembali ke Login
      </Link>
    </div>
  )
}

function RootComponent() {
  // Cuma merender Outlet tempat rute anak muncul
  return <Outlet />
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
})
  
