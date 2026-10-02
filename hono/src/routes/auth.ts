import { Hono } from 'hono'
import { setCookie, getCookie, deleteCookie } from 'hono/cookie'
import { sign, verify } from 'hono/jwt'
import postgres from 'postgres'
import crypto from 'node:crypto'

const auth = new Hono()

const sql = postgres(process.env.DATABASE_URL!)
const JWT_SECRET = process.env.JWT_SECRET || 'ganti-dengan-secret-key-yang-sangat-aman-12345'
const IS_PROD = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true'

// Helper: Verifikasi PBKDF2 Password Hash dari ASP.NET Core
function verifyAspNetCorePasswordHash(password: string, hashedPasswordBase64: string): boolean {
  try {
    const decodedHash = Buffer.from(hashedPasswordBase64, 'base64')
    if (decodedHash[0] !== 0x01) {
      console.log('  🔍 [HASH DEBUG] Format hash bukan V3 (0x01)')
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
    console.log('  🔍 [HASH DEBUG] Hasil pencocokan password:', isValid)
    return isValid
  } catch (err) {
    console.error('  🔍 [HASH DEBUG] Error dekode password hash:', err)
    return false
  }
}

// POST /login
auth.post('/login', async (c) => {
  try {
    const body = await c.req.json()
    const { username, password, rememberMe } = body
    const clientType = c.req.header('X-Client-Type')

    console.log('  📦 [LOGIN] Payload Body:', { username, passwordLength: password?.length, rememberMe })

    if (!username || !password) {
      console.log('  ❌ [LOGIN] Username atau password kosong')
      return c.json({ message: 'Username dan password wajib diisi' }, 400)
    }

    const normalizedInput = username.toUpperCase()
    console.log('  🔍 [LOGIN] Normalisasi UpperCase:', normalizedInput)

    const users = await sql`
      SELECT "Id", "UserName", "NormalizedUserName", "Email", "NormalizedEmail", "PasswordHash", "LockoutEnabled", "LockoutEnd"
      FROM "AspNetUsers"
      WHERE "NormalizedUserName" = ${normalizedInput} 
         OR "NormalizedEmail" = ${normalizedInput}
      LIMIT 1
    `

    console.log('  🗄️ [LOGIN] User Ditemukan di DB:', users.length)

    if (!users || users.length === 0) {
      console.log('  ❌ [LOGIN] User tidak ditemukan di DB:', normalizedInput)
      return c.json({ message: 'Username atau password salah' }, 401)
    }

    const user = users[0]
    console.log('  👤 [LOGIN] Detail User:', { id: user.Id, username: user.UserName, email: user.Email, hasPasswordHash: !!user.PasswordHash })

    if (!user.PasswordHash) {
      console.log('  ❌ [LOGIN] User tidak memiliki PasswordHash')
      return c.json({ message: 'Username atau password salah' }, 401)
    }

    const isPasswordValid = verifyAspNetCorePasswordHash(password, user.PasswordHash)
    if (!isPasswordValid) {
      console.log('  ❌ [LOGIN] Password tidak cocok')
      return c.json({ message: 'Username atau password salah' }, 401)
    }

    if (user.LockoutEnabled && user.LockoutEnd && new Date(user.LockoutEnd) > new Date()) {
      console.log('  ⛔ [LOGIN] Akun terjangkau lockout hingga:', user.LockoutEnd)
      return c.json({ message: 'Akun Anda sedang terkunci' }, 403)
    }

    const expSeconds = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24
    const expTimestamp = Math.floor(Date.now() / 1000) + expSeconds

    const token = await sign({ sub: user.Id, exp: expTimestamp }, JWT_SECRET, 'HS256')

    if (clientType === 'web') {
      console.log('  ✅ [LOGIN] Skenario WEB: Setting Cookie auth_token...')
      setCookie(c, 'auth_token', token, {
        httpOnly: true,
        secure: IS_PROD,
        sameSite: IS_PROD ? 'None' : 'Lax',
        path: '/',
        maxAge: expSeconds,
      })

      return c.json({ message: 'Login web berhasil', userId: user.Id })
    }

    if (clientType === 'mobile') {
      console.log('  ✅ [LOGIN] Skenario MOBILE: Return Raw JWT Token...')
      return c.json({
        message: 'Login mobile berhasil',
        token,
        expiresIn: expSeconds,
        userId: user.Id
      })
    }

    console.log('  ❌ [LOGIN] Header X-Client-Type tidak valid:', clientType)
    return c.json({ message: 'Header "X-Client-Type" wajib diset ke "web" atau "mobile"' }, 400)

  } catch (err) {
    console.error('  💥 [LOGIN] Fatal Error:', err)
    return c.json({ message: 'Terjadi kesalahan pada server' }, 500)
  }
})

// GET /me (Pemeriksaan status login & identitas user)
auth.get('/me', async (c) => {
  const clientType = c.req.header('X-Client-Type')
  let token: string | undefined

  if (clientType === 'web') {
    token = getCookie(c, 'auth_token')
  } else if (clientType === 'mobile') {
    const authHeader = c.req.header('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
  }

  if (!token) {
    return c.json({ authenticated: false, message: 'Sesi tidak ditemukan' }, 401)
  }

  try {
    const payload = await verify(token, JWT_SECRET, 'HS256')
    const userId = payload.sub as string

    const users = await sql`
      SELECT "Id", "UserName", "Email"
      FROM "AspNetUsers"
      WHERE "Id" = ${userId}
      LIMIT 1
    `

    if (!users || users.length === 0) {
      return c.json({ authenticated: false, message: 'User tidak ditemukan' }, 401)
    }

    const user = users[0]
    return c.json({
      authenticated: true,
      user: {
        id: user.Id,
        username: user.UserName,
        email: user.Email
      }
    })
  } catch (err) {
    return c.json({ authenticated: false, message: 'Token kadaluwarsa atau tidak valid' }, 401)
  }
})

// POST /logout
auth.post('/logout', (c) => {
  deleteCookie(c, 'auth_token', {
    path: '/',
    secure: IS_PROD,
    sameSite: IS_PROD ? 'None' : 'Lax',
  })
  return c.json({ message: 'Logout berhasil' })
})

export default auth
