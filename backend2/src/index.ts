import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { z } from 'zod';
import { env } from './lib/env.js';
import { logger } from './lib/logger.js';
import { redis } from './lib/redis.js';
import { registerMiddleware } from './middleware/index.js';
import { registerRoutes } from './routes/index.js';
import type { AppEnv } from './types/app.types.js';

/** Factory aplikasi Hono */
export function createApp(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();

  registerMiddleware(app);
  registerRoutes(app);

  return app;
}

// Inisialisasi aplikasi Hono
const app = createApp();

// Menjalankan HTTP server Node.js
const server = serve({ fetch: app.fetch, port: env.PORT, hostname: '0.0.0.0' }, (info) => {
  logger.info(`🚀 Server berjalan di http://0.0.0.0:${info.port}`);
});

// Graceful shutdown (Render mengirim SIGTERM saat deploy ulang)
const shutdown = async (signal: string) => {
  logger.info(`${signal} diterima, menutup server...`);

  // 2. Tutup koneksi Redis dengan aman sebelum proses exit
  try {
    await redis.quit();
    logger.info('Koneksi Redis berhasil ditutup.');
  } catch (err) {
    logger.error('Gagal menutup koneksi Redis:', err);
  }

  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
