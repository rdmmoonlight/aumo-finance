import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { neon } from '@neondatabase/serverless';
import { betterAuth } from 'better-auth';
import { bearer } from 'better-auth/plugins';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema/index.js';
import { env } from './env.js';

const db = drizzle({ client: neon(env.DATABASE_URL), schema });

const isProduction = env.NODE_ENV === 'production';

const trustedOrigins = Array.from(
  new Set(
    [...(env.CORS_ORIGINS?.split(',') ?? []), env.FRONTEND_URL ?? '']
      .map((origin) => origin.trim().replace(/\/$/, ''))
      .filter(Boolean)
  )
);

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET ?? env.JWT_SIGNING_KEY,
  baseURL: env.BETTER_AUTH_URL,
  // Handler bawaan Better Auth dipasang di /api/auth/* (lihat app.setup.ts)
  basePath: '/api/auth',
  trustedOrigins,

  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8, // selaras dengan auth.schemas.ts
    autoSignIn: true, // sesi langsung dibuat setelah registrasi
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 hari
    updateAge: 60 * 60 * 24, // perpanjang sesi tiap 1 hari aktif
  },

  // Mobile: token sesi dari body bisa dipakai sebagai "Authorization: Bearer <token>"
  plugins: [bearer()],

  // Frontend dan backend beda domain -> cookie wajib SameSite=None; Secure di production
  advanced: {
    defaultCookieAttributes: {
      sameSite: isProduction ? 'none' : 'lax',
      secure: isProduction,
      httpOnly: true,
    },
  },
});
