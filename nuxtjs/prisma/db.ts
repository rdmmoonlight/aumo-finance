import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'

// Muat variabel lingkungan dari .env
dotenv.config()

// Inisialisasi instance Prisma Client
export const db = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
})