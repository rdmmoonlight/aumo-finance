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
const IS_PROD = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true'

// Daftar tabel yang diizinkan untuk dibaca (mencegah SQL Injection)
const ALLOWED_TABLES = new Set([
  'AspNetRoleClaims', 'AspNetRoles', 'AspNetUserClaims', 'AspNetUserLogins',
  'AspNetUserRoles', 'AspNetUserTokens', 'AspNetUsers', 'ChartOfAccounts',
  'DataProtectionKeys', 'EconomicDocuments', 'Folders', 'JournalEntries',
  'JournalEntryLines', 'LoginActivities', 'Notifications', 'Periods',
  'RecoveryCodes', 'SecuritySettings', 'TransactionCounters', 'TrustedDevices',
  'UserSessions'
])

// Verifikasi Hash Password ASP.NET Core Identity (PBKDF2)
function verifyAspNetCorePasswordHash(password: string, hashedPasswordBase64: string): boolean {
  try {
    const decodedHash = Buffer.from(hashedPasswordBase64, 'base64')
    if (decodedHash[0] !== 0x01) {
      console.log('🔍 [HASH DEBUG] Format hash bukan V3 (0x01)')
      return false
    }

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

    const isValid = crypto.timingSafeEqual(expectedSubkey, actualSubkey)
    console.log('🔍 [HASH DEBUG] Hasil pencocokan password:', isValid)
    return isValid
  } catch (err) {
    console.error('🔍 [HASH DEBUG] Error saat dekode password hash:', err)
    return false
  }
}

// Configuration CORS
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://aumonuxtjs.vercel.app'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Client-Type'],
  allowMethods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true, // Wajib agar Cookie Web dikirim otomatis
}))

app.get('/', (c) => c.text('Hono Dual-Auth API is running!'))

// ==========================================
// 1. ENDPOINT AUTHENTICATION (Login & Logout)
// ==========================================
app.post('/api/auth/login', async (c) => {
  console.log('\n--- 🚀 LOGIN REQUEST MASUK ---')
  try {
    const body = await c.req.json()
    const { username, password, rememberMe } = body
    const clientType = c.req.header('X-Client-Type')

    console.log('📦 [LOGIN] Payload Body:', { username, passwordLength: password?.length, rememberMe })
    console.log('🏷️ [LOGIN] Header X-Client-Type:', clientType)

    if (!username || !password) {
      console.log('❌ [LOGIN] Username atau password kosong dalam payload')
      return c.json({ message: 'Username dan password wajib diisi' }, 400)
    }

    const normalizedInput = username.toUpperCase()
    console.log('🔍 [LOGIN] Input dinormalisasi ke UpperCase:', normalizedInput)

    const users = await sql`
      SELECT "Id", "UserName", "NormalizedUserName", "Email", "NormalizedEmail", "PasswordHash", "LockoutEnabled", "LockoutEnd"
      FROM "AspNetUsers"
      WHERE "NormalizedUserName" = ${normalizedInput} 
         OR "NormalizedEmail" = ${normalizedInput}
      LIMIT 1
    `

    console.log('🗄️ [LOGIN] Hasil Query DB (User ditemukan):', users.length)

    if (!users || users.length === 0) {
      console.log('❌ [LOGIN] User TIDAK DITEMUKAN di DB berdasarkan NormalizedUserName/Email:', normalizedInput)
      return c.json({ message: 'Username atau password salah' }, 401)
    }

    const user = users[0]
    console.log('👤 [LOGIN] User DB Ditemukan:', { id: user.Id, username: user.UserName, email: user.Email, hasPasswordHash: !!user.PasswordHash })

    if (!user.PasswordHash) {
      console.log('❌ [LOGIN] User tidak memiliki PasswordHash di DB')
      return c.json({ message: 'Username atau password salah' }, 401)
    }

    const isPasswordValid = verifyAspNetCorePasswordHash(password, user.PasswordHash)
    if (!isPasswordValid) {
      console.log('❌ [LOGIN] Password TIDAK COCOK dengan PasswordHash')
      return c.json({ message: 'Username atau password salah' }, 401)
    }

    if (user.LockoutEnabled && user.LockoutEnd && new Date(user.LockoutEnd) > new Date()) {
      console.log('⛔ [LOGIN] Akun sedang terkunci hingga:', user.LockoutEnd)
      return c.json({ message: 'Akun Anda sedang terkunci' }, 403)
    }

    // Masa aktif token (30 hari jika RememberMe, 1 hari jika tidak)
    const expSeconds = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24
    const expTimestamp = Math.floor(Date.now() / 1000) + expSeconds

    // Buat JWT Token
    const token = await sign({ sub: user.Id, exp: expTimestamp }, JWT_SECRET, 'HS256')

    // PERATURAN WEB: Pakai Cookie HTTP-Only
    if (clientType === 'web') {
      console.log('✅ [LOGIN] Skenario WEB: Setting Cookie auth_token...')
      setCookie(c, 'auth_token', token, {
        httpOnly: true,
        secure: IS_PROD,
        sameSite: IS_PROD ? 'None' : 'Lax',
        path: '/',
        maxAge: expSeconds,
      })

      return c.json({ message: 'Login web berhasil', userId: user.Id })
    }

    // PERATURAN MOBILE: Pakai Raw Token JWT
    if (clientType === 'mobile') {
      console.log('✅ [LOGIN] Skenario MOBILE: Mengembalikan Raw JWT Token...')
      return c.json({
        message: 'Login mobile berhasil',
        token,
        expiresIn: expSeconds,
        userId: user.Id
      })
    }

    console.log('❌ [LOGIN] Gagal: Header X-Client-Type bernilai invalid/tidak ada:', clientType)
    return c.json({ message: 'Header "X-Client-Type" wajib diset ke "web" atau "mobile"' }, 400)

  } catch (err) {
    console.error('💥 [LOGIN] Fatal Error/Exception:', err)
    return c.json({ message: 'Terjadi kesalahan pada server' }, 500)
  }
})

// Logout untuk Web Client
app.post('/api/auth/logout', (c) => {
  deleteCookie(c, 'auth_token', {
    path: '/',
    secure: IS_PROD,
    sameSite: IS_PROD ? 'None' : 'Lax',
  })
  return c.json({ message: 'Logout berhasil' })
})

// ==========================================
// 2. MIDDLEWARE PROTEKSI DUAL-AUTH
// ==========================================
app.use('/api/*', async (c, next) => {
  // Biarkan endpoint auth bebas diakses
  if (c.req.path.startsWith('/api/auth/')) {
    return next()
  }

  const clientType = c.req.header('X-Client-Type')
  let token: string | undefined

  // Skenario Web: Baca dari Cookie
  if (clientType === 'web') {
    token = getCookie(c, 'auth_token')
    if (!token) {
      return c.json({ error: 'Akses Ditolak: Cookie auth_token tidak ditemukan' }, 401)
    }
  } 
  // Skenario Mobile: Baca dari Header Authorization
  else if (clientType === 'mobile') {
    const authHeader = c.req.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Akses Ditolak: Header Bearer JWT tidak ditemukan' }, 401)
    }
    token = authHeader.substring(7)
  } 
  else {
    return c.json({ error: 'Header "X-Client-Type" wajib diset ("web" atau "mobile")' }, 400)
  }

  // Verifikasi JWT Token
  try {
    const payload = await verify(token, JWT_SECRET, 'HS256')
    c.set('userId', payload.sub as string)
    await next()
  } catch (err) {
    return c.json({ error: 'Sesi / Token tidak valid atau telah kadaluwarsa' }, 401)
  }
})

// ==========================================
// 3. ENDPOINTS DATA (Terproteksi)
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

serve({
  fetch: app.fetch,
  port,
})

export default app
