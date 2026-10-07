import http from 'node:http';
import { env } from './lib/env.js';
import { sendJson } from './lib/http.js';
import { logger } from './lib/logger.js';
import { httpLogger } from './middleware/logger.js';
import { handleRoutes } from './routes/index.js';

const server = http.createServer(async (req, res) => {
  // 1. Jalankan logging HTTP (merekam request masuk & response keluar)
  httpLogger(req, res);

  try {
    const isHandled = await handleRoutes(req, res);

    if (!isHandled) {
      sendJson(res, 404, { error: 'Route tidak ditemukan' });
    }
  } catch (error) {
    // 2. Log unhandled error via pino logger agar formatnya terstruktur
    logger.error(error, 'Unhandled Error');
    sendJson(res, 500, { error: 'Terjadi kesalahan pada server' });
  }
});

server.listen(env.PORT, '0.0.0.0', () => {
  logger.info(`🚀 Server berjalan di http://0.0.0.0:${env.PORT}`);
});