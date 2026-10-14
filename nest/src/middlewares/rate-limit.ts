import { Context, Next } from 'hono';

export const rateLimit = (options?: { scope?: string }) => {
  return async (c: Context, next: Next) => {
    const scope = options?.scope || 'global';
    const prefix = scope === 'auth' ? 'ratelimit:auth:' : 'ratelimit:global:';
    c.set('rateLimitPrefix', prefix);
    await next();
  };
};
