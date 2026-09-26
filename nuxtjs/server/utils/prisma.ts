import { PrismaClient } from '@prisma/client'

// Mencegah pembuatan instance berulang saat Hot-Reload (Dev) & Cold Start (Serverless)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Aktifkan log error saja di produksi agar respons lebih cepat
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
