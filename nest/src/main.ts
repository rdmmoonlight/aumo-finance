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

console.log('STEP 1: Starting bootstrap...');

process.on('uncaughtException', (err: any) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  console.error(err?.stack || err);
  try { logger.fatal({ err }, 'Uncaught Exception'); } catch {}
  process.exit(1);
});

process.on('unhandledRejection', (reason: any) => {
  console.error('UNHANDLED REJECTION:', reason);
  console.error((reason as any)?.stack || reason);
  try { logger.error({ reason }, 'Unhandled Rejection'); } catch {}
});

async function bootstrap() {
  try {
    console.log('STEP 2: initQueueWorkers...');
    initQueueWorkers();
    console.log('STEP 3: Queue workers init done');

    console.log('STEP 4: NestFactory.create...');
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: false,
      bodyParser: false,
      // Error DI/bootstrap dilempar ke catch di bawah (bukan exit senyap karena logger: false)
      abortOnError: false,
    });
    console.log('STEP 5: App created');

    console.log('STEP 6: configureApp...');
    configureApp(app);
    console.log('STEP 7: configureApp done');

    console.log('STEP 8: Swagger setup...');
    const config = new DocumentBuilder()
      .setTitle('Aumone API')
      .setDescription('Dokumentasi API')
      .setVersion('2.0.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('openapi', app, document, { ui: false, jsonDocumentUrl: 'openapi.json' });
    app.use('/reference', apiReference({ spec: { content: document } }));
    console.log('STEP 9: Swagger done');

    console.log(`STEP 10: app.listen PORT=${env.PORT}...`);
    const host = '0.0.0.0';
    await app.listen(env.PORT, host);
    console.log('STEP 11: listen done');

    const displayHost = host === '0.0.0.0' ? 'localhost' : host;
    logger.info(`🚀 Server berjalan di http://${displayHost}:${env.PORT}`);
    console.log(`🚀 Server berjalan di http://${displayHost}:${env.PORT}`);

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
        await app.close();
        logger.info('Server HTTP berhasil ditutup.');
        await closeQueue();
        await redis.quit();
        logger.info('Koneksi Redis berhasil ditutup.');
        process.exit(0);
      } catch (err) {
        logger.error({ err }, 'Gagal menutup koneksi server/Redis/Queue');
        console.error('SHUTDOWN FAILED:', err);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('SIGINT', () => void shutdown('SIGINT'));
  } catch (err: any) {
    console.error('BOOTSTRAP FAILED AT STEP:', err);
    console.error(err?.stack || err);
    console.error(JSON.stringify(err, null, 2));
    try { logger.fatal({ err }, 'Bootstrap failed'); } catch {}
    // Don't exit immediately, let logs flush
    setTimeout(() => process.exit(1), 500);
  }
}

bootstrap();