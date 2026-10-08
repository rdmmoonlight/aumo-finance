import { serve } from '@hono/node-server';
import { createApp } from './app.js';
import { env } from './lib/env.js';
import { logger } from './lib/logger.js';

const app = createApp();

const server = serve({ fetch: app.fetch, port: env.PORT, hostname: '0.0.0.0' }, (info) => {
  logger.info(`🚀 Server berjalan di http://0.0.0.0:${info.port}`);
});

// Graceful shutdown (Render mengirim SIGTERM saat deploy ulang)
const shutdown = (signal: string) => {
  logger.info(`${signal} diterima, menutup server...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
