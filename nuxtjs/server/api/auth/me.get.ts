export default defineEventHandler(async (event) => {
  return backendFetch(event, '/api/v1/auth/me')
})
