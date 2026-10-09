import { requireAuth } from './auth.middleware';
import type { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { requestId } from 'hono/request-id';
import { secureHeaders } from 'hono/secure-headers';
import { env } from '../lib/env.js';
import type { AppEnv } from '../types/app.types.js';
import { corsMiddleware } from './cors.js';
import { errorHandler, notFoundHandler } from './error-handler.js';
import { requestLogger } from './logger.js';
import { rateLimit } from './rate-limit.js';

/**
 * Middleware pipeline global. Urutan eksekusi (atas -> bawah):
 *
 *  1. requestId     : ID unik per request (header X-Request-Id)
 *  2. secureHeaders : header keamanan standar
 *  3. cors          : allowlist origin + credentials (menjawab preflight lebih awal)
 *  4. requestLogger : log masuk/keluar + durasi + status
 *  5. bodyLimit     : tolak body di atas batas (413)
 *  6. rateLimit     : pembatas request umum per IP
 *
 * Lalu error handler & 404 handler terpasang di level app.
 * Auth (requireAuth) dan rate limit khusus (mis. /auth) dipasang per-route.
 */
export function registerMiddleware(app: Hono<AppEnv>): void {
  app.use('*', requestId());
  app.use('*', secureHeaders({ crossOriginResourcePolicy: 'cross-origin' }));
  app.use('*', corsMiddleware());
  app.use('*', requestLogger());
  app.use(
    '*',
    bodyLimit({
      maxSize: env.BODY_LIMIT_BYTES,
      onError: (c) => c.json({ message: 'Ukuran request terlalu besar' }, 413),
    })
  );
  app.use(
    '*',
    rateLimit({ scope: 'global', max: env.RATE_LIMIT_MAX, windowMs: env.RATE_LIMIT_WINDOW_MS })
  );

  app.onError(errorHandler);
  app.notFound(notFoundHandler);
}
