import { zValidator } from '@hono/zod-validator';
import { Hono, type Context } from 'hono';
import { googleLoginRequestSchema, loginRequestSchema } from '../db/auth.schema.js';
import { clearAuthCookie, setAuthCookie } from '../lib/cookies.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { authService } from '../services/auth.service.js';
import type { AppEnv } from '../types/app.types.js';

export const authRoute = new Hono<AppEnv>();

function getClientInfo(c: Context<AppEnv>) {
  const ip =
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ??
    c.req.header('x-real-ip') ??
    '0.0.0.0';
  const ua = c.req.header('user-agent') ?? 'Unknown';
  return { ip, ua };
}

// POST /auth/login
authRoute.post('/login', zValidator('json', loginRequestSchema), async (c) => {
  const body = c.req.valid('json');
  const { ip, ua } = getClientInfo(c);

  const result = await authService.processLogin(body, ip, ua);
  if (!result?.success) {
    const isLocked = result?.message === 'LOCKED_OUT';
    return c.json(
      { success: false, message: isLocked ? 'Akun terkunci 15 menit' : 'Email atau password salah' },
      isLocked ? 423 : 401
    );
  }

  if (!body.isMobileClient) {
    const profile = await authService.getUserProfile(result.userId!);
    if (!profile) return c.json({ success: false, message: 'User not found' }, 404);

    const { id: _pid, roles: _r, ...restProfile } = profile;
    const tokenPayload = {
      ...restProfile,
      id: result.userId!,
      roles: profile.roles.map((r: string) => ({ role: { name: r } })),
    } as Parameters<typeof authService.generateJwtToken>[0];

    const token = authService.generateJwtToken(tokenPayload);
    setAuthCookie(c, token);
    return c.json({ ...result, token: undefined });
  }

  return c.json(result);
});

// POST /auth/google
authRoute.post('/google', zValidator('json', googleLoginRequestSchema), async (c) => {
  const body = c.req.valid('json');
  const result = await authService.processGoogleLogin(body);
  if (!result) return c.json({ success: false, message: 'Google login gagal' }, 401);

  if (!body.isMobileClient && result.userId) {
    const fallbackUser = {
      id: result.userId,
      fullName: result.fullName,
      email: '',
      roles: [],
    } as Parameters<typeof authService.generateJwtToken>[0];

    const token = result.token ?? authService.generateJwtToken(fallbackUser);
    if (token) setAuthCookie(c, token);
    return c.json({ ...result, token: undefined });
  }

  return c.json(result);
});

authRoute.get('/google/url', (c) => {
  const redirectUrl = c.req.query('redirectUrl') || `${c.req.url.split('/auth')[0]}/auth/google/callback`;
  try {
    const data = authService.configureGoogleRedirect(redirectUrl);
    return c.json({ success: true, url: data.url });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Invalid redirectUrl';
    return c.json({ success: false, message }, 400);
  }
});

authRoute.get('/me', requireAuth(), async (c) => {
  const user = c.get('user');
  const profile = await authService.getUserProfile(user.sub);
  if (!profile) return c.json({ success: false, message: 'User not found' }, 404);
  return c.json({ success: true, data: profile });
});

authRoute.post('/logout', async (c) => {
  const user = c.get('user');
  const sessionId = c.get('sessionId');
  clearAuthCookie(c);
  await authService.logout(user?.sub, sessionId);
  return c.json({ success: true, message: 'Logged out' });
});