import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';
import { env } from './lib/env.js';
import { logger } from './lib/logger.js';
import { closeQueue, initQueueWorkers } from './lib/queue.js';
import { redis } from './lib/redis.js';

async function bootstrap() {
  // Inisialisasi Queue Worker
  initQueueWorkers();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // Logger bawaan Nest dimatikan, seluruh log memakai Pino
    logger: false,
    // Body parser dipasang manual di configureApp (Better Auth butuh body mentah)
    bodyParser: false,
  });

  configureApp(app);

  // Penyiapan Dokumentasi OpenAPI & Scalar
  const config = new DocumentBuilder()
    .setTitle('Aumone API')
    .setDescription('Dokumentasi API')
    .setVersion('2.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Spec mentah di /openapi.json (tanpa UI Swagger bawaan)
  SwaggerModule.setup('openapi', app, document, {
    ui: false,
    jsonDocumentUrl: 'openapi.json',
  });

  app.use('/reference', apiReference({ spec: { content: document } }));

  // Jalankan HTTP Server
  const host = '0.0.0.0';
  await app.listen(env.PORT, host);

  const displayHost = host === '0.0.0.0' ? 'localhost' : host;
  logger.info(`🚀 Server berjalan di http://${displayHost}:${env.PORT}`);

  // Graceful shutdown
  let isShuttingDown = false;

  const shutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info(`${signal} diterima, menutup server...`);

    const forceExit = setTimeout(() => {
      logger.error('Penutupan paksa karena batas waktu graceful shutdown terlampaui.');
      process.exit(1);
    }, 10_000);
    forceExit.unref();

    try {
      // 1. Tutup aplikasi NestJS (HTTP Server)
      await app.close();
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

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

// Global Exception Handler
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught Exception terdeteksi');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled Rejection terdeteksi');
});

bootstrap();