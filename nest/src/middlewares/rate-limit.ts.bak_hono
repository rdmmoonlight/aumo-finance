import { Context, Next } from 'hono';
import { redis } from '../lib/redis.js';
import { env } from '../lib/env.js';

export const rateLimit = (options?: { scope?: string; max?: number; windowMs?: number }) => {
  return async (c: Context, next: Next) => {
    const path = c.req.path || c.req.url || '';
    const isAuthPath = path.startsWith('/auth');
    const scope = options?.scope || (isAuthPath ? 'auth' : 'global');
    const prefix = scope === 'auth' ? 'ratelimit:auth:' : 'ratelimit:global:';
    const max = options?.max || (scope === 'auth' ? (env as any).AUTH_RATE_LIMIT_MAX || 10 : (env as any).RATE_LIMIT_MAX || 100);
    const windowMs = options?.windowMs || (env as any).RATE_LIMIT_WINDOW_MS || 60_000;
    const windowSec = Math.ceil(windowMs / 1000);

    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    const key = `${prefix}${ip}`;

    try {
      const pipe = (redis as any).pipeline();
      pipe.incr(key);
      const results = await Promise.race([
        pipe.exec(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1000)),
      ]);
      const count = Number((results as any)?.[0]?.[1] ?? 1);
      if (count === 1) {
        await (redis as any).expire(key, windowSec);
      }

      c.header('RateLimit-Limit', String(max));
      c.header('RateLimit-Remaining', String(Math.max(0, max - count)));
      c.header('RateLimit-Reset', String(Math.floor(Date.now() / 1000) + windowSec));

      if (count > max) {
        return c.json({ success: false, message: 'Terlalu banyak permintaan' }, 429);
      }

      c.set('rateLimitPrefix', prefix);
      await next();
    } catch (e) {
      // fail-open
      c.set('rateLimitPrefix', prefix);
      await next();
    }
  };
};
