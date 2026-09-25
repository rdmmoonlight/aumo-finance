export default defineNuxtRouteMiddleware(async (to) => {
  const user = useAuthUser()
  const checked = useAuthChecked()

  // Ambil data user jika belum dicek
  if (!checked.value) {
    await fetchAuthUser()
  }

  // Definisikan rute mana saja yang bebas diakses tanpa login
  const publicRoutes = ['/', '/login', '/register']
  const isPublicRoute = publicRoutes.includes(to.path)

  // 1. Jika BELUM login dan mencoba buka rute terproteksi (misal /dashboard, /settings)
  if (!user.value && !isPublicRoute) {
    return navigateTo({ 
      path: '/login', 
      query: to.fullPath !== '/' ? { redirect: to.fullPath } : undefined 
    })
  }

  // 2. Jika SUDAH login tetapi malah buka halaman login/register
  if (user.value && (to.path === '/login' || to.path === '/register')) {
    return navigateTo('/')
  }
})
