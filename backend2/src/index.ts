import http from 'node:http';
import { env } from './lib/env.js';
import { sendJson } from './lib/http.js';
import { logger } from './lib/logger.js';
import { httpLogger } from './middleware/logger.js';
import { handleRoutes } from './routes/index.js';

const server = http.createServer(async (req, res) => {
  // 1. Jalankan logging HTTP
  httpLogger(req, res);

  try {
    // 2. Tangani seluruh route aplikasi (termasuk /auth/login, /auth/logout, dll)
    const isHandled = await handleRoutes(req, res);

    if (!isHandled) {
      sendJson(res, 404, { error: 'Route tidak ditemukan' });
    }
  } catch (error) {
    // 3. Log unhandled error
    logger.error(error, 'Unhandled Error');
    sendJson(res, 500, { error: 'Terjadi kesalahan pada server' });
  }
});

server.listen(env.PORT, '0.0.0.0', () => {
  logger.info(`🚀 Server berjalan di http://0.0.0.0:${env.PORT}`);
});