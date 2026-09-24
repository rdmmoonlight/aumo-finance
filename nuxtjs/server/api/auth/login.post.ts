export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  return backendFetch(event, '/api/v1/auth/login', {
    method: 'POST',
    body
  })
})
