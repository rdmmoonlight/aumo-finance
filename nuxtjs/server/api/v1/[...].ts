// server/api/v1/[...].ts

export default defineEventHandler(async (event) => {
  // 1. Ambil path suffix dari catch-all parameter
  const suffix = event.context.params?._ ?? ''
  const path = Array.isArray(suffix) ? suffix.join('/') : suffix

  // 2. Ambil query string (contoh: ?search=abc&page=2) jika ada
  const query = getRequestURL(event).search

  // 3. Gabungkan path dan query string ke backend target
  const targetPath = `/api/v1/${path}${query}`

  return proxyToBackend(event, targetPath)
})