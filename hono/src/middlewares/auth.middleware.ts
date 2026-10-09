import { requireAuth } from './auth.middleware';
import type { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';
import { AUTH_COOKIE } from '../lib/cookies.js';
import type { AppEnv } from '../types/app.types.js';

function extractToken(authHeader: string | undefined, cookieToken: string | undefined) {
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7).trim();
  return cookieToken;
}

export const requireAuth = (): MiddlewareHandler<AppEnv> => async (c, next) => {
  const token = extractToken(c.req.header('authorization'), getCookie(c, AUTH_COOKIE));
  if (!token) return c.json({ success: false, message: 'Unauthorized' }, 401);
};