import { serve } from '@hono/node-server';
import { OpenAPIHono } from '@hono/zod-openapi';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { env } from './lib/env.js';
import { logger } from './lib/logger.js';
import { closeQueue, initQueueWorkers } from './lib/queue.js';
import { redis } from './lib/redis.js';
import { registerMiddleware } from './middlewares/index.js';
import { registerRoutes } from './routes/index.js';
import type { AppEnv } from './types/app.types.js';

// Inisialisasi koneksi Neon Client & Drizzle ORM
export const sql = neon(env.DATABASE_URL);
export const db = drizzle({ client: sql });

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

// Jalankan Worker Queue
initQueueWorkers();

// Inisialisasi aplikasi Hono
export const app = createApp();

// Menjalankan HTTP server Node.js
const server = serve(
  { fetch: app.fetch, port: env.PORT, hostname: '0.0.0.0' },
  (info) => {
    logger.info(`🚀 Server berjalan di http://0.0.0.0:${info.port}`);
  }
);

// Graceful shutdown
const shutdown = async (signal: string) => {
  logger.info(`${signal} diterima, menutup server...`);

  // Force exit timeout
  const forceExit = setTimeout(() => {
    logger.error('Penutupan paksa karena batas waktu graceful shutdown terlampaui.');
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  try {
    // 1. Tutup HTTP Server terlebih dahulu
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
    logger.info('Server HTTP berhasil ditutup.');

    // 2. Tutup BullMQ Worker & Queue
    await closeQueue();

    // 3. Tutup koneksi Redis
    await redis.quit();
    logger.info('Koneksi Redis berhasil ditutup.');

    process.exit(0);
  } catch (err) {
    logger.error({ err }, 'Gagal menutup koneksi server/Redis/Queue');
    process.exit(1);
  }
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