import { Hono } from 'hono';
import { clearAuthCookie } from '../lib/cookies';
import type { AppEnv } from '../types/app.types';

// Import authService & requireAuth middleware
import { requireAuth } from '../middlewares/auth';
import { authService } from '../services/auth.service';

export const authRoute = new Hono<AppEnv>();

// GET /auth/google/url
authRoute.get('/google/url', (c) => {
  const redirectUrl =
    c.req.query('redirectUrl') ||
    `${c.req.url.split('/auth')[0]}/auth/google/callback`;
  try {
    const data = authService.configureGoogleRedirect(redirectUrl);
    return c.json({ success: true, url: data.url });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Invalid redirectUrl';
    return c.json({ success: false, message }, 400);
  }
});

// GET /auth/me
authRoute.get('/me', requireAuth(), async (c) => {
  const user = c.get('user');
  const profile = await authService.getUserProfile(user.sub);
  if (!profile) return c.json({ success: false, message: 'User not found' }, 404);
  return c.json({ success: true, data: profile });
});

// POST /auth/logout
authRoute.post('/logout', async (c) => {
  const user = c.get('user');
  const sessionId = c.get('sessionId');
  clearAuthCookie(c);
  await authService.logout(user?.sub, sessionId);
  return c.json({ success: true, message: 'Logged out' });
});