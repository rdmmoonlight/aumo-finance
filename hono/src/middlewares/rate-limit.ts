import { getConnInfo } from '@hono/node-server/conninfo';
import type { MiddlewareHandler } from 'hono';
import { redis } from '../lib/redis.js';
import type { AppEnv } from '../types/app.types.js';

interface RateLimitOptions {
  /** Nama scope; tiap scope punya counter sendiri di Redis. */
  scope: string;
  /** Jumlah request maksimum per jendela waktu. */
  max: number;
  /** Panjang jendela waktu (ms). */
  windowMs: number;
}

function getClientIp(c: Parameters<MiddlewareHandler>[0]): string {
  // Di balik reverse proxy (Cloudflare, Render, dll)
  const cfIp = c.req.header('cf-connecting-ip');
  if (cfIp) return cfIp;

  const forwarded = c.req.header('x-forwarded-for')?.split(',')[0]?.trim();
  if (forwarded) return forwarded;

  try {
    return getConnInfo(c).remote.address ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Rate limiter fixed-window menggunakan Redis.
 * Aman untuk multi-instance deployment.
 */
export const rateLimit =
  ({ scope, max, windowMs }: RateLimitOptions): MiddlewareHandler<AppEnv> =>
    async (c, next) => {
      const ip = getClientIp(c);
      const key = `ratelimit:${scope}:${ip}`;

      try {
        // Jalankan pipeline atomic di Redis
        const pipeline = redis.pipeline();
        pipeline.incr(key);
        pipeline.pttl(key);

        const results = await pipeline.exec();

        if (!results) {
          throw new Error('Redis pipeline failed');
        }

        const count = results[0][1] as number;
        let ttl = results[1][1] as number;

        // Jika key baru dibuat (TTL belum ada atau -1), set waktu kadaluarsa (PEXPIRE dalam ms)
        if (ttl < 0) {
          await redis.pexpire(key, windowMs);
          ttl = windowMs;
        }

        const remaining = Math.max(0, max - count);
        const resetSeconds = Math.ceil(ttl / 1000);

        c.header('RateLimit-Limit', String(max));
        c.header('RateLimit-Remaining', String(remaining));
        c.header('RateLimit-Reset', String(resetSeconds));

        if (count > max) {
          c.header('Retry-After', String(resetSeconds));
          return c.json(
            { message: 'Terlalu banyak request, coba lagi nanti' },
            429
          );
        }
      } catch (err) {
        // Fallback grace strategy jika Redis mengalami gangguan, request tetap diloloskan
        c.var.logger?.error({ err }, 'Rate limiter Redis error, bypassing limit check');
      }

      await next();
    };