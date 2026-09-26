// app/middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
  // Hanya jalankan logika otentikasi di sisi Client (Browser)
  if (import.meta.server) return

  const user = useAuthUser()
  const checked = useAuthChecked()

  const publicRoutes = ['/', '/login', '/register']
  const normalizedPath = to.path.length > 1 && to.path.endsWith('/') 
    ? to.path.slice(0, -1) 
    : to.path

  const isPublicRoute = publicRoutes.includes(normalizedPath)

  // Ambil data user dari client jika belum pernah diperiksa
  if (!checked.value) {
    try {
      await fetchAuthUser()
    } catch {
      user.value = null
      checked.value = true
    }
  }

  // 1. Jika BELUM login & mencoba akses rute privat -> Redirect ke /login
  if (!user.value && !isPublicRoute) {
    return navigateTo({
      path: '/login',
      query: to.fullPath !== '/' ? { redirect: to.fullPath } : undefined
    })
  }

  // 2. Jika SUDAH login & membuka rute publik -> Redirect ke /home
  if (user.value && isPublicRoute) {
    return navigateTo('/home')
  }
})
