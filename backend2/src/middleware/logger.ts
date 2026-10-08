import type { MiddlewareHandler } from 'hono';
import { logger } from '../lib/logger.js';
import type { AppEnv } from '../types/app.types.js';

/**
 * Logger request/response berbasis pino.
 * Hanya mencatat path (tanpa query string) agar token/code OAuth tidak bocor ke log,
 * dan tidak pernah mencatat header Authorization maupun Cookie.
 */
export const requestLogger = (): MiddlewareHandler<AppEnv> => async (c, next) => {
  const start = performance.now();
  const { method } = c.req;
  const path = c.req.path;
  const requestId = c.get('requestId');

  logger.info({ requestId }, `--> [IN] ${method} ${path}`);

  await next();

  const status = c.res.status;
  const ms = Math.round(performance.now() - start);
  const message = `<-- [OUT] ${method} ${path} ${status} (${ms}ms)`;

  if (status >= 500) logger.error({ requestId, status, ms }, message);
  else if (status >= 400) logger.warn({ requestId, status, ms }, message);
  else logger.info({ requestId, status, ms }, message);
};
