import { serve } from '@hono/node-server';
import { OpenAPIHono } from '@hono/zod-openapi';
import { env } from './lib/env.js';
import { logger } from './lib/logger.js';
import { redis } from './lib/redis.js';
import { registerMiddleware } from './middlewares/index.js';
import { registerRoutes } from './routes/index.js';
import type { AppEnv } from './types/app.types.js';

/** Factory aplikasi Hono */
export function createApp(): OpenAPIHono<AppEnv> {
  const app = new OpenAPIHono<AppEnv>();

  registerMiddleware(app);
  registerRoutes(app);

  // Fallback Error Handler global Hono
  app.onError((err, c) => {
    logger.error({ err, url: c.req.url }, 'Unhandled route error');
    return c.json({ message: 'Internal Server Error' }, 500);
  });

  return app;
}

// Inisialisasi aplikasi Hono
const app = createApp();

// Menjalankan HTTP server Node.js
const server = serve({ fetch: app.fetch, port: env.PORT, hostname: '0.0.0.0' }, (info) => {
  logger.info(`🚀 Server berjalan di http://0.0.0.0:${info.port}`);
});

// Graceful shutdown
const shutdown = async (signal: string) => {
  logger.info(`${signal} diterima, menutup server...`);

  try {
    await redis.quit();
    logger.info('Koneksi Redis berhasil ditutup.');
  } catch (err) {
    logger.error({ err }, 'Gagal menutup koneksi Redis');
  }

  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Tangkap crash yang tidak terduga
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught Exception terdeteksi');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled Rejection terdeteksi');
});

