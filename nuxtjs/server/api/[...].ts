// server/api/[...].ts
import { Hono } from 'hono'
import { setCookie, getCookie } from 'hono/cookie'
import { toWebRequest } from 'h3' // 👈 Import toWebRequest dari h3

// Sesuaikan basePath agar mendukung rute /api/v1
const app = new Hono().basePath('/api/v1')

// POST /api/v1/auth/login
app.post('/auth/login', async (c) => {
  const { email, password } = await c.req.json()

  if (email === 'user@example.com' && password === 'password123') {
    const user = { id: '1', name: 'User Example', email }
    const token = 'fake-jwt-token-12345'

    setCookie(c, 'auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    })

    return c.json({ success: true, user })
  }

  return c.json({ success: false, message: 'Email atau password salah' }, 401)
})

// POST /api/v1/auth/register
app.post('/auth/register', async (c) => {
  const { name, email, password } = await c.req.json()

  if (!password || password.length < 6) {
    return c.json(
      { success: false, message: 'Password minimal 6 karakter' },
      400
    )
  }

  const newUser = { id: Date.now().toString(), name, email }
  return c.json({ success: true, user: newUser }, 201)
})

// GET /api/v1/auth/me
app.get('/auth/me', (c) => {
  const token = getCookie(c, 'auth_token')
  if (!token) {
    return c.json({ authenticated: false }, 401)
  }

  return c.json({
    authenticated: true,
    user: { id: '1', name: 'User Example', email: 'user@example.com' }
  })
})

// POST /api/v1/auth/logout
app.post('/auth/logout', (c) => {
  setCookie(c, 'auth_token', '', { maxAge: 0, path: '/' })
  return c.json({ success: true })
})

// Nitro Event Handler
export default defineEventHandler((event) => {
  // 👈 Ubah event.web!.request menjadi toWebRequest(event)
  const request = toWebRequest(event)
  return app.fetch(request)
})
