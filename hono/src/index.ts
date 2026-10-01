import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'

const app = new Hono()

// CORS Configuration
app.use('*', cors({
  origin: [
    'http://localhost:3000',
    'https://aumonuxtjs.vercel.app'
  ],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}))

// Health check endpoint (Sangat berguna untuk Render ping health checks)
app.get('/', (c) => {
  return c.text('Hono API is running perfectly!')
})

// Sample Route
app.get('/periods', async (c) => {
  return c.json([])
})

// Wajib untuk Render: Ambil PORT dari environment variable
const port = Number(process.env.PORT) || 3000

console.log(`Server is running on port ${port}`)

// Jalankan HTTP Server
serve({
  fetch: app.fetch,
  port,
})

export default app
