export default defineNuxtRouteMiddleware(async (to) => {
  const user = useAuthUser()
  const checked = useAuthChecked()

  if (!checked.value) {
    await fetchAuthUser()
  }

  const publicRoutes = ['/', '/login', '/register']
  const isPublicRoute = publicRoutes.includes(to.path)

  // 1. Jika BELUM login dan mencoba akses rute terproteksi (seperti /home) -> Redirect ke /login
  if (!user.value && !isPublicRoute) {
    return navigateTo({ 
      path: '/login', 
      query: to.fullPath !== '/' ? { redirect: to.fullPath } : undefined 
    })
  }

  // 2. Jika SUDAH login dan mencoba buka Landing Page Publik (/) atau Login/Register -> Redirect ke Landing Page Member (/home)
  if (user.value && (to.path === '/' || to.path === '/login' || to.path === '/register')) {
    return navigateTo('/home')
  }
})
