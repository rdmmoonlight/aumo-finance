import type { MiddlewareHandler } from 'hono';
import { logger } from '../lib/logger.js';
import type { AppEnv } from '../types/app.types.js';

/**
 * Logger request/response berbasis Pino.
 * Hanya mencatat path (tanpa query string) agar credential/token OAuth tidak bocor ke log,
 * serta tidak pernah mencatat header sensitif seperti Authorization atau Cookie.
 */
export const requestLogger = (): MiddlewareHandler<AppEnv> => async (c, next) => {
  const start = performance.now();
  const method = c.req.method;
  const path = c.req.path;
  
  // Mengambil requestId (fallback ke undefined jika belum di-set)
  const requestId = c.get('requestId') as string | undefined;

  logger.info({ requestId, method, path }, `--> [IN] ${method} ${path}`);

  try {
    await next();
  } catch (err) {
    // Menangkap error unhandled agar durasi dan status 500 tetap ter-log sebelum dilempar ke app.onError
    const ms = Math.round(performance.now() - start);
    logger.error(
      { requestId, method, path, status: 500, ms, err },
      `<-- [OUT] ${method} ${path} 500 (${ms}ms) - Exception`
    );
    throw err;
  }

  const status = c.res.status;
  const ms = Math.round(performance.now() - start);
  const logData = { requestId, method, path, status, ms };
  const message = `<-- [OUT] ${method} ${path} ${status} (${ms}ms)`;

  if (status >= 500) {
    logger.error(logData, message);
  } else if (status >= 400) {
    logger.warn(logData, message);
  } else {
    logger.info(logData, message);
  }
};
