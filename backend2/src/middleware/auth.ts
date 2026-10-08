import type { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';
import { verifyJwt } from '../lib/auth.js';
import type { AppEnv } from '../types/app.types.js';

/** Ambil token dari header Bearer (mobile) atau cookie access_token (web). */
function extractToken(authorization: string | undefined, cookieToken: string | undefined) {
  if (authorization?.startsWith('Bearer ')) {
    return authorization.slice('Bearer '.length).trim();
  }
  return cookieToken;
}

/**
 * Wajib login. Mengisi c.get('user') bila token valid, selain itu 401.
 * Pasang per-route / per-group: app.use('/reports/*', requireAuth())
 */
export const requireAuth = (): MiddlewareHandler<AppEnv> => async (c, next) => {
  const token = extractToken(c.req.header('authorization'), getCookie(c, 'access_token'));

  if (!token) {
    return c.json({ message: 'Unauthorized' }, 401);
  }

  const payload = verifyJwt(token);
  if (!payload) {
    return c.json({ message: 'Invalid or expired token' }, 401);
  }

  c.set('user', payload);
  await next();
};
