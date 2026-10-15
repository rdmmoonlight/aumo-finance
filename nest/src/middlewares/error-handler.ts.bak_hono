import { Context, Next } from 'hono';

export const errorHandler = async (c: Context, next: Next) => {
  try {
    const contentLength = c.req.header('content-length');
    const limitBytes = Number(process.env.BODY_LIMIT_BYTES || 1024 * 1024);
    if (contentLength && parseInt(contentLength, 10) > limitBytes) {
      return c.json({ success: false, message: 'Ukuran request terlalu besar' }, 413);
    }
    await next();
  } catch (err: any) {
    if (err instanceof SyntaxError || err.name === 'SyntaxError' || (err.message && err.message.includes('JSON'))) {
      return c.json({ success: false, message: 'Format JSON tidak valid' }, 400);
    }
    return c.json({ success: false, message: 'Terjadi kesalahan pada server' }, 500);
  }
};
