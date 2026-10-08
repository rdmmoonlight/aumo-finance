import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { z } from 'zod';
import { ValidationError } from './errors.js';

/**
 * Baca JSON body dari request dan validasi dengan Zod schema.
 * - Body kosong dianggap {}
 * - JSON rusak -> 400
 * - Validasi gagal -> ValidationError (ditangani errorHandler menjadi 400)
 */
export async function parseBody<T>(c: Context, schema: z.ZodType<T>): Promise<T> {
  const raw = await c.req.text();

  let json: unknown = {};
  if (raw) {
    try {
      json = JSON.parse(raw);
    } catch {
      throw new HTTPException(400, { message: 'Format JSON tidak valid' });
    }
  }

  const result = await schema.safeParseAsync(json);
  if (!result.success) {
    throw new ValidationError(result.error);
  }
  return result.data;
}
