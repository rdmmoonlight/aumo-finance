import type { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';
import { verifyJwt } from '../lib/auth.js';
import { AUTH_COOKIE } from '../lib/cookies.js';
import type { AppEnv, JwtPayload } from '../types/auth.types.js';

function extractToken(authHeader: string | undefined, cookieToken: string | undefined) {
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7).trim();
  return cookieToken;
}

export const requireAuth = (): MiddlewareHandler<AppEnv> => async (c, next) => {
  const token = extractToken(c.req.header('authorization'), getCookie(c, AUTH_COOKIE));
  if (!token) return c.json({ success: false, message: 'Unauthorized' }, 401);

  const payload = verifyJwt(token) as JwtPayload | null;
  if (!payload) return c.json({ success: false, message: 'Invalid or expired token' }, 401);

  c.set('user', payload);
  await next();
};

export const requireRole = (...roles: string[]): MiddlewareHandler<AppEnv> => async (c, next) => {
  const user = c.get('user');
  if (!user?.roles?.some((r: string) => roles.includes(r))) {
    return c.json({ success: false, message: 'Forbidden' }, 403);
  }
  await next();
};