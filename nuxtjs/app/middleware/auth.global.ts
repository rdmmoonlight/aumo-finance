export default defineNuxtRouteMiddleware(async (to) => {
  const user = useAuthUser()
  const checked = useAuthChecked()

  // Daftar rute publik (tidak memerlukan login)
  const publicRoutes = ['/', '/login', '/register']
  
  // Normalisasi path agar aman dari trailing slash (misal: /login/ -> /login)
  const normalizedPath = to.path.length > 1 && to.path.endsWith('/') 
    ? to.path.slice(0, -1) 
    : to.path

  const isPublicRoute = publicRoutes.includes(normalizedPath)

  // 1. Ambil data user dari server HANYA jika status belum diperiksa.
  // Dibungkus try-catch agar jika server proxy / backend offline, middleware TIDAK membuat Vercel crash 500.
  if (!checked.value) {
    try {
      await fetchAuthUser()
    } catch (err) {
      // Jika fetchAuthUser gagal (misal 401 atau backend offline),
      // tandai checked = true dan anggap user belum login
      checked.value = true
      user.value = null
    }
  }

  // 2. Jika BELUM login & mengakses rute privat -> Redirect ke /login
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
