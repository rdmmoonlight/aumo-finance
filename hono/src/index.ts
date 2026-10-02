import 'dotenv/config'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import { setCookie, getCookie, deleteCookie } from 'hono/cookie'
import { sign, verify } from 'hono/jwt'
import postgres from 'postgres'
import crypto from 'node:crypto'

type Variables = {
  userId: string
}

const app = new Hono<{ Variables: Variables }>()

const sql = postgres(process.env.DATABASE_URL!)
const JWT_SECRET = process.env.JWT_SECRET || 'ganti-dengan-secret-key-yang-sangat-aman-12345'

// Daftar tabel yang diizinkan untuk dibaca
const ALLOWED_TABLES = new Set([
  'AspNetRoleClaims', 'AspNetRoles', 'AspNetUserClaims', 'AspNetUserLogins',
  'AspNetUserRoles', 'AspNetUserTokens', 'AspNetUsers', 'ChartOfAccounts',
  'DataProtectionKeys', 'EconomicDocuments', 'Folders', 'JournalEntries',
  'JournalEntryLines', 'LoginActivities', 'Notifications', 'Periods',
  'RecoveryCodes', 'SecuritySettings', 'TransactionCounters', 'TrustedDevices',
  'UserSessions'
])

// Helper Verifikasi Password Hash ASP.NET Core Identity
function verifyAspNetCorePasswordHash(password: string, hashedPasswordBase64: string): boolean {
  try {
    const decodedHash = Buffer.from(hashedPasswordBase64, 'base64')
    if (decodedHash[0] !== 0x01) return false

    const prf = decodedHash.readUInt32BE(1)
    const iterCount = decodedHash.readUInt32BE(5)
    const saltLength = decodedHash.readUInt32BE(9)

    let algo = 'sha256'
    if (prf === 2) algo = 'sha512'
    else if (prf === 0) algo = 'sha1'

    const salt = decodedHash.subarray(13, 13 + saltLength)
    const expectedSubkey = decodedHash.subarray(13 + saltLength)

    const actualSubkey = crypto.pbkdf2Sync(
      password,
      salt,
      iterCount,
      expectedSubkey.length,
      algo
    )

    return crypto.timingSafeEqual(expectedSubkey, actualSubkey)
  } catch {
    return false
  }
}

// Global CORS Middleware
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://aumo-blazor2.onrender.com'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Client-Type'],
  allowMethods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true, // Wajib true agar Cookie bisa terkirim dari Web
}))

app.get('/', (c) => c.text('Hono Dual-Auth API is running!'))

// ==========================================
// 1. ENDPOINT LOGIN (Web & Mobile)
// ==========================================
app.post('/api/auth/login', async (c) => {
  try {
    const { username, password, rememberMe } = await c.req.json()
    const clientType = c.req.header('X-Client-Type') // 'web' atau 'mobile'

    if (!username || !password) {
      return c.json({ message: 'Username dan password wajib diisi' }, 400)
    }

    const normalizedInput = username.toUpperCase()
    const users = await sql`
      SELECT "Id", "PasswordHash", "LockoutEnabled", "LockoutEnd"
      FROM "AspNetUsers"
      WHERE "NormalizedUserName" = ${normalizedInput} 
         OR "NormalizedEmail" = ${normalizedInput}
      LIMIT 1
    `

    if (!users || users.length === 0) {
      return c.json({ message: 'Username atau password salah' }, 401)
    }

    const user = users[0]

    if (!user.PasswordHash || !verifyAspNetCorePasswordHash(password, user.PasswordHash)) {
      return c.json({ message: 'Username atau password salah' }, 401)
    }

    if (user.LockoutEnabled && user.LockoutEnd && new Date(user.LockoutEnd) > new Date()) {
      return c.json({ message: 'Akun Anda sedang terkunci' }, 403)
    }

    // Durasi Token/Cookie (30 Hari jika RememberMe, 1 Hari jika Tidak)
    const expSeconds = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24
    const expTimestamp = Math.floor(Date.now() / 1000) + expSeconds

    // Buat JWT
    const token = await sign({ sub: user.Id, exp: expTimestamp }, JWT_SECRET)

    // PERATURAN 1: Pengguna Web Wajib Menggunakan Cookie (HTTP-Only)
    if (clientType === 'web') {
      setCookie(c, 'auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/',
        maxAge: expSeconds,
      })

      return c.json({ message: 'Login web berhasil', userId: user.Id })
    }

    // PERATURAN 2: Pengguna Mobile Wajib Menggunakan JWT Token
    if (clientType === 'mobile') {
      return c.json({
        message: 'Login mobile berhasil',
        token,
        expiresIn: expSeconds,
        userId: user.Id
      })
    }

    return c.json({ message: 'Header X-Client-Type wajib diisi ("web" atau "mobile")' }, 400)

  } catch (err) {
    console.error('Login Error:', err)
    return c.json({ message: 'Terjadi kesalahan pada server' }, 500)
  }
})

// Endpoint Logout khusus Web
app.post('/api/auth/logout', (c) => {
  deleteCookie(c, 'auth_token', { path: '/' })
  return c.json({ message: 'Logout berhasil' })
})

// ==========================================
// 2. MIDDLEWARE DUAL-AUTHENTICATION
// ==========================================
app.use('/api/*', async (c, next) => {
  // Biarkan endpoint login diakses publik
  if (c.req.path === '/api/auth/login') {
    return next()
  }

  const clientType = c.req.header('X-Client-Type')
  let token: string | undefined

  // Web Wajib Cookie
  if (clientType === 'web') {
    token = getCookie(c, 'auth_token')
    if (!token) {
      return c.json({ error: 'Akses Ditolak: Cookie auth_token tidak ditemukan' }, 401)
    }
  } 
  // Mobile Wajib Bearer Token JWT
  else if (clientType === 'mobile') {
    const authHeader = c.req.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Akses Ditolak: Header Bearer JWT tidak ditemukan' }, 401)
    }
    token = authHeader.substring(7)
  } 
  else {
    return c.json({ error: 'Aturan Klien Ditolak: Header "X-Client-Type" wajib diset ("web" atau "mobile")' }, 400)
  }

  // Verifikasi JWT Token
  try {
    const payload = await verify(token, JWT_SECRET)
    c.set('userId', payload.sub as string)
    await next()
  } catch (err) {
    return c.json({ error: 'Sesi / Token tidak valid atau telah kadaluwarsa' }, 401)
  }
})

// ==========================================
// 3. ENDPOINTS DATA
// ==========================================
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

const port = Number(process.env.PORT) || 3000
console.log(`Server is running on port ${port}`)

serve({ fetch: app.fetch, port })

export default app
