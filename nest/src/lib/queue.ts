import { Queue, Worker } from 'bullmq';
import { logger } from './logger.js';
import { redis } from './redis.js';

// 1. Queue instance (memakai koneksi Redis yang sudah ada)
export const reportQueue = new Queue('reports', {
  connection: redis,
});

// 2. Inisialisasi worker
let reportWorker: Worker | null = null;

export function initQueueWorkers() {
  reportWorker = new Worker(
    'reports',
    async (job) => {
      logger.info({ jobId: job.id, name: job.name }, 'Memproses background job');

      if (job.name === 'generate-report') {
        // Logika laporan berkala
      }
    },
    { connection: redis }
  );

  reportWorker.on('completed', (job) => {
    logger.info({ jobId: job.id }, 'Job selesai diproses');
  });

  reportWorker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'Job gagal diproses');
  });

  logger.info('⚙️ BullMQ Worker berhasil dijalankan');
}

// 3. Helper graceful shutdown untuk queue & worker
export async function closeQueue() {
  if (reportWorker) {
    await reportWorker.close();
  }
  await reportQueue.close();
  logger.info('Koneksi BullMQ Queue & Worker berhasil ditutup.');
}
