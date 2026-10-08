import { Hono } from 'hono';
import { deleteCookie } from 'hono/cookie';
import { env } from '../lib/env.js';
import { parseBody } from '../lib/http.js';
import { rateLimit } from '../middleware/rate-limit.js';
import { authService } from '../services/auth.service.js';
import type { AppEnv } from '../types/app.types.js';

export const authRoutes = new Hono<AppEnv>();

authRoutes.use(
  '*',
  rateLimit({ scope: 'auth', max: env.AUTH_RATE_LIMIT_MAX, windowMs: env.RATE_LIMIT_WINDOW_MS })
);

// POST /auth/register
authRoutes.post('/register', async (c) => {
  const body = await parseBody(c, registerSchema);
  const { user, token } = await authService.register(body);

  if (body.clientType === 'mobile') {
    return c.json({ message: 'Registrasi berhasil', token, user }, 201);
  }

  setAuthCookie(c, token);
  return c.json({ message: 'Registrasi berhasil', user }, 201);
});

// POST /auth/login
authRoutes.post('/login', async (c) => {
  const body = await parseBody(c, loginSchema);
  const { tokenPayload, token } = await authService.login(body);

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
  const code = c.req.query('code');
  const { token } = await authService.handleGoogleCallback(code);

  setAuthCookie(c, token);
  const frontendUrl = env.FRONTEND_URL ?? 'http://localhost:3000';
  return c.redirect(`${frontendUrl}/dashboard?token=${token}`, 302);
});