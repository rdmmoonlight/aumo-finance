import type { NestExpressApplication } from '@nestjs/platform-express';
import { toNodeHandler } from 'better-auth/node';
import helmet from 'helmet';
import { bodyParserErrorMiddleware } from './common/middleware/body-parser-error.middleware.js';
import { requestIdMiddleware } from './common/middleware/request-id.middleware.js';
import { requestLoggerMiddleware } from './common/middleware/request-logger.middleware.js';
import { createCorsOptions } from './config/cors.js';
import { auth } from './lib/auth.js';
import { env } from './lib/env.js';

/**
 * Middleware pipeline global (urutan eksekusi atas -> bawah), setara registerMiddleware di /hono:
 *
 *  1. requestId     : ID unik per request (header X-Request-Id)
 *  2. helmet        : header keamanan standar
 *  3. cors          : allowlist origin + credentials (menjawab preflight lebih awal)
 *  4. requestLogger : log masuk/keluar + durasi + status
 *  5. Better Auth   : handler bawaan di /api/auth/* (wajib sebelum body parser)
 *  6. bodyLimit     : body parser dengan batas ukuran (413 jika terlewati)
 *
 * Rate limit (guard global), validasi (pipe) dan error handler (filter) dipasang di AppModule.
 * Aplikasi harus dibuat dengan { bodyParser: false }.
 */
export function configureApp(app: NestExpressApplication): void {
  app.use(requestIdMiddleware);
  app.use(
    helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } })
  );
  app.enableCors(createCorsOptions());
  app.use(requestLoggerMiddleware);

  app.getHttpAdapter().getInstance().all('/auth/*', toNodeHandler(auth));

  app.useBodyParser('json', { limit: env.BODY_LIMIT_BYTES });
  app.useBodyParser('urlencoded', { limit: env.BODY_LIMIT_BYTES, extended: true });
  app.use(bodyParserErrorMiddleware);
}
