export default defineNuxtRouteMiddleware(async (to) => {
  const user = useAuthUser()
  const checked = useAuthChecked()

  // 1. Ambil data user dari server jika status otentikasi belum pernah diperiksa
  if (!checked.value) {
    await fetchAuthUser()
  }

  // Daftar rute publik (tidak memerlukan login)
  const publicRoutes = ['/', '/login', '/register']
  
  // Normalisasi path agar aman dari trailing slash (misal: /login/ -> /login)
  const normalizedPath = to.path.length > 1 && to.path.endsWith('/') 
    ? to.path.slice(0, -1) 
    : to.path

  const isPublicRoute = publicRoutes.includes(normalizedPath)

  // 2. Jika BELUM login & mengakses rute privat -> Redirect ke /login dengan query parameter 'redirect'
  if (!user.value && !isPublicRoute) {
    return navigateTo({
      path: '/login',
      query: to.fullPath !== '/' ? { redirect: to.fullPath } : undefined
    })
  }

  // 3. Jika SUDAH login & mengakses rute publik (/, /login, /register) -> Redirect ke /home
  if (user.value && isPublicRoute) {
    return navigateTo('/home')
  }
})