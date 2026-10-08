import type { ErrorHandler, NotFoundHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ValidationError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';
import type { AppEnv } from '../types/app.types.js';

export const errorHandler: ErrorHandler<AppEnv> = (err, c) => {
  if (err instanceof ValidationError) {
    return c.json({ message: err.message, errors: err.errors }, 400);
  }

  if (err instanceof HTTPException) {
    if (err.res) return err.getResponse();
    return c.json({ message: err.message }, err.status);
  }

  logger.error({ err, requestId: c.get('requestId') }, 'Unhandled Error');
  return c.json({ error: 'Terjadi kesalahan pada server' }, 500);
};

export const notFoundHandler: NotFoundHandler<AppEnv> = (c) =>
  c.json({ error: 'Route tidak ditemukan' }, 404);
