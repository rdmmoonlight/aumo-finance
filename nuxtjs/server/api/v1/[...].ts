// Catch-all proxy: forwards every /api/v1/** call this app makes
// straight to the matching controller/route in /backend, so pages
// (e.g. settings/security.vue, settings/members.vue) can call
// `$fetch('/api/v1/...')` using the exact path the backend controller
// exposes, with no per-endpoint file needed on this side.
export default defineEventHandler(async (event) => {
  const suffix = event.context.params?._ ?? ''
  const path = Array.isArray(suffix) ? suffix.join('/') : suffix

  return proxyToBackend(event, `/api/v1/${path}`)
})
