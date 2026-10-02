import 'dotenv/config'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import { getCookie } from 'hono/cookie'
import { verify } from 'hono/jwt'
import postgres from 'postgres'
import authRoutes from './routes/auth'

type Variables = {
  userId: string
}

const app = new Hono<{ Variables: Variables }>()

const sql = postgres(process.env.DATABASE_URL!)
const JWT_SECRET = process.env.JWT_SECRET || 'ganti-dengan-secret-key-yang-sangat-aman-12345'

const ALLOWED_TABLES = new Set([
  'AspNetRoleClaims', 'AspNetRoles', 'AspNetUserClaims', 'AspNetUserLogins',
  'AspNetUserRoles', 'AspNetUserTokens', 'AspNetUsers', 'ChartOfAccounts',
  'DataProtectionKeys', 'EconomicDocuments', 'Folders', 'JournalEntries',
  'JournalEntryLines', 'LoginActivities', 'Notifications', 'Periods',
  'RecoveryCodes', 'SecuritySettings', 'TransactionCounters', 'TrustedDevices',
  'UserSessions'
])

// 1. CORS Middleware
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://aumonuxtjs.vercel.app'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Client-Type'],
  allowMethods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}))

// 2. Global Logging Middleware
app.use('*', async (c, next) => {
  const start = Date.now()
  const method = c.req.method
  const path = c.req.path
  const clientType = c.req.header('X-Client-Type') || 'N/A'
  const userAgent = c.req.header('User-Agent') || 'Unknown'
  const clientIp = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'Local/Unknown'

  console.log(`\n==================================================`)
  console.log(`📥 [REQUEST IN] ${new Date().toISOString()}`)
  console.log(`   --> ${method} ${path}`)
  console.log(`   --> IP: ${clientIp}`)
  console.log(`   --> X-Client-Type: ${clientType}`)
  console.log(`   --> User-Agent: ${userAgent}`)

  await next()

  const ms = Date.now() - start
  const status = c.res.status
  const statusEmoji = status < 300 ? '✅' : status < 400 ? '🔀' : status < 500 ? '⚠️' : '💥'

  console.log(`📤 [RESPONSE OUT] ${statusEmoji} Status: ${status} | Duration: ${ms}ms`)
  console.log(`==================================================\n`)
})

app.get('/', (c) => c.text('Hono Dual-Auth API is running!'))

// 3. Mount Sub-Router Autentikasi
app.route('/api/auth', authRoutes)

// 4. Middleware Proteksi Data Endpoints
app.use('/api/*', async (c, next) => {
  // Lewati proteksi jika path menunjuk ke rute auth
  if (c.req.path.startsWith('/api/auth/')) {
    return next()
  }

  const clientType = c.req.header('X-Client-Type')
  let token: string | undefined

  if (clientType === 'web') {
    token = getCookie(c, 'auth_token')
    if (!token) {
      console.log('  ⚠️️ [AUTH MIDDLEWARE] Ditolak: Cookie auth_token tidak ditemukan')
      return c.json({ error: 'Akses Ditolak: Cookie auth_token tidak ditemukan' }, 401)
    }
  } else if (clientType === 'mobile') {
    const authHeader = c.req.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('  ⚠️️ [AUTH MIDDLEWARE] Ditolak: Header Bearer JWT tidak ditemukan')
      return c.json({ error: 'Akses Ditolak: Header Bearer JWT tidak ditemukan' }, 401)
    }
    token = authHeader.substring(7)
  } else {
    console.log('  ⚠️️ [AUTH MIDDLEWARE] Ditolak: Header X-Client-Type tidak valid')
    return c.json({ error: 'Header "X-Client-Type" wajib diset ("web" atau "mobile")' }, 400)
  }

  try {
    const payload = await verify(token, JWT_SECRET, 'HS256')
    c.set('userId', payload.sub as string)
    await next()
  } catch (err) {
    console.log('  ⚠️ [AUTH MIDDLEWARE] Ditolak: Token JWT kadaluwarsa/invalid')
    return c.json({ error: 'Sesi / Token tidak valid atau telah kadaluwarsa' }, 401)
  }
})

// 5. Data Endpoints
app.get('/api/tables', (c) => {
  return c.json({ tables: Array.from(ALLOWED_TABLES) })
})

app.get('/api/:tableName', async (c) => {
  const tableName = c.req.param('tableName')

  if (!ALLOWED_TABLES.has(tableName)) {
    return c.json({ error: `Tabel '${tableName}' tidak ditemukan atau tidak diizinkan.` }, 404)
  }

  try {
    const data = await sql.unsafe(`SELECT * FROM "${tableName}" LIMIT 100`)
    return c.json(data)
  } catch (error) {
    console.error(`Error querying ${tableName}:`, error)
    return c.json({ error: `Gagal mengambil data dari tabel ${tableName}` }, 500)
  }
})

// 6. Server Bootstrap
const port = Number(process.env.PORT) || 3000

const server = serve({
  fetch: app.fetch,
  port,
}, (info) => {
  console.log(`🚀 Server Node/Hono berjalan aktif di port ${info.port}`)
})

process.on('SIGTERM', () => {
  console.log('🛑 Menerima SIGTERM, menutup server dengan aman...')
  server.close(() => {
    process.exit(0)
  })
})

export default app
