import type { MiddlewareHandler } from 'hono';
import { getConnInfo } from '@hono/node-server/conninfo';
import type { AppEnv } from '../types/app.types.js';

interface RateLimitOptions {
  /** Nama scope; tiap scope punya counter sendiri. */
  scope: string;
  /** Jumlah request maksimum per jendela waktu. */
  max: number;
  /** Panjang jendela waktu (ms). */
  windowMs: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Bersihkan bucket kedaluwarsa agar memori tidak membengkak.
const cleanup = setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}, 60_000);
cleanup.unref();

function getClientIp(c: Parameters<MiddlewareHandler>[0]): string {
  // Di balik proxy (Render, dll) IP asli ada di X-Forwarded-For.
  const forwarded = c.req.header('x-forwarded-for')?.split(',')[0]?.trim();
  if (forwarded) return forwarded;
  try {
    return getConnInfo(c).remote.address ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Rate limiter fixed-window in-memory per IP.
 * Catatan: counter tersimpan per proses; jika di-scale ke banyak instance,
 * ganti store dengan Redis.
 */
export const rateLimit =
  ({ scope, max, windowMs }: RateLimitOptions): MiddlewareHandler<AppEnv> =>
  async (c, next) => {
    const key = `${scope}:${getClientIp(c)}`;
    const now = Date.now();

    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }
    bucket.count += 1;

    const remaining = Math.max(0, max - bucket.count);
    const resetSeconds = Math.ceil((bucket.resetAt - now) / 1000);

    c.header('RateLimit-Limit', String(max));
    c.header('RateLimit-Remaining', String(remaining));
    c.header('RateLimit-Reset', String(resetSeconds));

    if (bucket.count > max) {
      c.header('Retry-After', String(resetSeconds));
      return c.json({ message: 'Terlalu banyak request, coba lagi nanti' }, 429);
    }

    await next();
  };
