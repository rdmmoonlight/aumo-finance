import { Hono, type Context } from 'hono';
import { deleteCookie, setCookie } from 'hono/cookie';
import { z } from 'zod';
import { signJwt, verifyPasswordAspNet } from '../lib/auth.js';
import { env } from '../lib/env.js';
import { parseBody } from '../lib/http.js';
import { rateLimit } from '../middleware/rate-limit.js';
import { userService } from '../services/user.service.js';
import type { AppEnv } from '../types/app.types.js';

const registerSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  name: z.string().optional(),
  clientType: z.enum(['web', 'mobile']).optional().default('web'),
});

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
  clientType: z.enum(['web', 'mobile']).optional().default('web'),
});

const AUTH_COOKIE = 'access_token';
const AUTH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 hari (detik)
const isProd = () => env.NODE_ENV === 'production';

function setAuthCookie(c: Context<AppEnv>, token: string): void {
  setCookie(c, AUTH_COOKIE, token, {
    httpOnly: true,
    path: '/',
    maxAge: AUTH_COOKIE_MAX_AGE,
    sameSite: 'Lax',
    secure: isProd(),
  });
}

export const authRoutes = new Hono<AppEnv>();

// Pembatas request lebih ketat untuk seluruh endpoint /auth (anti brute-force)
authRoutes.use(
  '*',
  rateLimit({ scope: 'auth', max: env.AUTH_RATE_LIMIT_MAX, windowMs: env.RATE_LIMIT_WINDOW_MS })
);

// POST /auth/register
authRoutes.post('/register', async (c) => {
  const body = await parseBody(c, registerSchema);

  const existingUser = await userService.findByEmail(body.email);
  if (existingUser) {
    return c.json({ message: 'Email sudah terdaftar' }, 400);
  }

  const user = await userService.createUser({
    email: body.email,
    password: body.password,
    clientType: body.clientType,
    name: body.name,
  });

  const token = signJwt({ userId: user.id, email: user.email, role: user.role });

  if (body.clientType === 'mobile') {
    return c.json({ message: 'Registrasi berhasil', token, user }, 201);
  }

  setAuthCookie(c, token);
  return c.json({ message: 'Registrasi berhasil', user }, 201);
});

// POST /auth/login
authRoutes.post('/login', async (c) => {
  const body = await parseBody(c, loginSchema);

  const user = await userService.findByEmail(body.email);
  if (!user || !verifyPasswordAspNet(body.password, user.passwordHash)) {
    return c.json({ message: 'Email atau password salah' }, 401);
  }

  const tokenPayload = { userId: user.id, email: user.email, role: user.role };
  const token = signJwt(tokenPayload);

  if (body.clientType === 'mobile') {
    return c.json({ message: 'Login berhasil', token, user: tokenPayload });
  }

  setAuthCookie(c, token);
  return c.json({ message: 'Login berhasil', user: tokenPayload });
});

// POST /auth/logout
authRoutes.post('/logout', (c) => {
  deleteCookie(c, AUTH_COOKIE, { path: '/', httpOnly: true, sameSite: 'Lax' });
  return c.json({ message: 'Logout berhasil' });
});

// GET /auth/google/callback
authRoutes.get('/google/callback', async (c) => {
  try {
    const code = c.req.query('code');

    if (!code) {
      return c.json({ message: 'Authorization code tidak ditemukan' }, 400);
    }

    const user = await userService.findOrCreateGoogleUser({
      email: 'user@gmail.com',
      name: 'Google User',
      googleId: '123456789',
    });

    const token = signJwt({ userId: user.id, email: user.email, role: user.role });
    setAuthCookie(c, token);

    const frontendUrl = env.FRONTEND_URL ?? 'http://localhost:3000';
    return c.redirect(`${frontendUrl}/dashboard?token=${token}`, 302);
  } catch {
    return c.json({ message: 'Gagal autentikasi Google OAuth' }, 500);
  }
});
