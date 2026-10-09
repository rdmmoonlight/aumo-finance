import { Hono } from 'hono'

export const healthRoute = new Hono()

// Root GET /
healthRoute.get('/', (c) => {
  return c.json({ status: 'ok', message: 'AumoBackend API Server Online 🚀' })
})

// Root HEAD /
healthRoute.on('HEAD', '/', (c) => {
  return c.body(null, 200)
})

// GET /api/v1/health
healthRoute.get('/health', async (c) => {
  //const status = await healthService.getHealthStatus?.()
  return c.json({
    // status: status?.status || 'pass',
    timestamp: new Date().toISOString(),
    // ...status,
  })
})