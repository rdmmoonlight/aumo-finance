// Protects every page except /login. Runs once per full app load (both
// on the server for the first request, and again client-side on full
// page refresh) and then relies on the cached auth-user/auth-checked
// state for subsequent client-side navigations.
export default defineNuxtRouteMiddleware(async (to) => {
  const user = useAuthUser()
  const checked = useAuthChecked()

  if (!checked.value) {
    await fetchAuthUser()
  }

  const isLoginPage = to.path === '/login'

  if (!user.value && !isLoginPage) {
    return navigateTo({ path: '/login', query: to.fullPath !== '/' ? { redirect: to.fullPath } : undefined })
  }

  if (user.value && isLoginPage) {
    return navigateTo('/')
  }
})
