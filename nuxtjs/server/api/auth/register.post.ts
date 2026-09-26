import { randomUUID, randomBytes, pbkdf2Sync } from 'node:crypto'

/**
 * Helper untuk membuat password hash yang kompatibel dengan ASP.NET Core Identity (Identity V3/PBKDF2)
 * Jika nantinya C# backend juga memverifikasi password ini, hash formatnya sesuai dengan ASP.NET Identity.
 */
function hashPasswordAspNet(password: string): string {
  const salt = randomBytes(16) // 128-bit salt
  const key = pbkdf2Sync(password, salt, 10000, 32, 'sha256') // HMAC-SHA256, 10k iterations, 256-bit subkey
  
  // Format ASP.NET Identity V3: 0x01 (Header) + Algoritma (4 byte) + Iterasi (4 byte) + Length Salt (4 byte) + Salt + Subkey
  const output = Buffer.alloc(1 + 4 + 4 + 4 + salt.length + key.length)
  output.writeUInt8(0x01, 0) // Format marker V3
  output.writeUInt32BE(1, 1) // KeyDerivationPrf.HMACSHA256
  output.writeUInt32BE(10000, 5) // Iteration count
  output.writeUInt32BE(salt.length, 9) // Salt size
  salt.copy(output, 13)
  key.copy(output, 13 + salt.length)

  return output.toString('base64')
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { email, password, fullName, userName } = body || {}

  // 1. Validasi Input Dasar
  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email dan password wajib diisi.',
    })
  }

  const normalizedEmail = email.trim().toUpperCase()
  const targetUserName = userName ? userName.trim() : email.trim()
  const normalizedUserName = targetUserName.toUpperCase()

  try {
    // 2. Cek apakah Email atau Username sudah terdaftar (menggunakan prisma dari auto-import server/utils/prisma.ts)
    const existingUser = await prisma.aspNetUsers.findFirst({
      where: {
        OR: [
          { NormalizedEmail: normalizedEmail },
          { NormalizedUserName: normalizedUserName }
        ]
      }
    })

    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Email atau username sudah terdaftar.',
      })
    }

    // 3. Hash Password & Generate UUID serta Security Stamp
    const passwordHash = hashPasswordAspNet(password)
    const userId = randomUUID()
    const securityStamp = randomUUID().replace(/-/g, '').toUpperCase()
    const concurrencyStamp = randomUUID()

    // 4. Simpan ke database via Prisma
    const newUser = await prisma.aspNetUsers.create({
      data: {
        Id: userId,
        FullName: fullName || null,
        UserName: targetUserName,
        NormalizedUserName: normalizedUserName,
        Email: email.trim(),
        NormalizedEmail: normalizedEmail,
        EmailConfirmed: false,
        PasswordHash: passwordHash,
        SecurityStamp: securityStamp,
        ConcurrencyStamp: concurrencyStamp,
        PhoneNumberConfirmed: false,
        TwoFactorEnabled: false,
        LockoutEnabled: true,
        AccessFailedCount: 0,
      },
      select: {
        Id: true,
        FullName: true,
        UserName: true,
        Email: true,
      }
    })

    return {
      success: true,
      message: 'Registrasi berhasil.',
      user: newUser
    }

  } catch (error: any) {
    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Terjadi kesalahan server saat registrasi.',
    })
  }
})