import 'dotenv/config'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { basicAuth } from 'hono/basic-auth'
import { serve } from '@hono/node-server'
import postgres from 'postgres'
import crypto from 'node:crypto'

type Variables = {
  userId: string
}

// 2. Pass tipe Variables ke instance Hono
const app = new Hono<{ Variables: Variables }>()

const sql = postgres(process.env.DATABASE_URL!)

// Daftar tabel yang diizinkan untuk dibaca (mencegah SQL Injection pada nama tabel)
const ALLOWED_TABLES = new Set([
  'AspNetRoleClaims', 'AspNetRoles', 'AspNetUserClaims', 'AspNetUserLogins',
  'AspNetUserRoles', 'AspNetUserTokens', 'AspNetUsers', 'ChartOfAccounts',
  'DataProtectionKeys', 'EconomicDocuments', 'Folders', 'JournalEntries',
  'JournalEntryLines', 'LoginActivities', 'Notifications', 'Periods',
  'RecoveryCodes', 'SecuritySettings', 'TransactionCounters', 'TrustedDevices',
  'UserSessions'
])

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

app.use('*', cors({
  origin: ['http://localhost:3000', 'https://aumo-blazor2.onrender.com'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}))

app.get('/', (c) => c.text('Hono Read-Only API is running!'))

// Apply Basic Auth ke semua API route
app.use('/api/*', async (c, next) => {
  const authHandler = basicAuth({
    verifyUser: async (username, password) => {
      try {
        const normalizedInput = username.toUpperCase()
        const users = await sql`
          SELECT "Id", "PasswordHash", "LockoutEnabled", "LockoutEnd"
          FROM "AspNetUsers"
          WHERE "NormalizedUserName" = ${normalizedInput} 
             OR "NormalizedEmail" = ${normalizedInput}
          LIMIT 1
        `

        if (!users || users.length === 0) return false
        const user = users[0]

        if (!user.PasswordHash) return false
        if (user.LockoutEnabled && user.LockoutEnd && new Date(user.LockoutEnd) > new Date()) {
          return false
        }

        // Simpan UserId ke context untuk diproses di route jika perlu filter data
        c.set('userId', user.Id)

        return verifyAspNetCorePasswordHash(password, user.PasswordHash)
      } catch (err) {
        console.error('Auth Error:', err)
        return false
      }
    },
  })

  return authHandler(c, next)
})

// 1. Endpoint untuk list semua tabel yang bisa diakses
app.get('/api/tables', (c) => {
  return c.json({ tables: Array.from(ALLOWED_TABLES) })
})

// 2. Endpoint Dinamis untuk membaca tabel mana saja
app.get('/api/:tableName', async (c) => {
  const tableName = c.req.param('tableName')

  // Validasi agar hanya tabel terdaftar yang bisa di-query
  if (!ALLOWED_TABLES.has(tableName)) {
    return c.json({ error: `Tabel '${tableName}' tidak ditemukan atau tidak diizinkan.` }, 404)
  }

  try {
    // Karena nama tabel tidak bisa di-parameterize dengan $, kita gunakan sql.unsafe dengan proteksi whitelist di atas
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