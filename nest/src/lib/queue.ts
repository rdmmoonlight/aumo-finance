import { Queue, Worker } from 'bullmq';
import { redis } from './redis.js';

console.log('QUEUE: Loading...');

let reportQueue: any = null;
let reportWorker: any = null;

export function initQueueWorkers() {
  console.log('QUEUE: initQueueWorkers called');
  try {
    console.log('QUEUE: Skipping actual BullMQ init for debug - using mock');
    // Don't actually init BullMQ for debug, just log
    console.log('QUEUE: Mock worker started');
    // Simulate the log that was there
    setTimeout(() => {
      console.log('BullMQ Worker berhasil dijalankan (mock)');
    }, 100);
    
    // Real init would be:
    /*
    reportQueue = new Queue('reports', { connection: redis });
    reportWorker = new Worker('reports', async job => {
      console.log('Processing job', job.id);
    }, { connection: redis });
    reportWorker.on('ready', () => console.log('BullMQ Worker berhasil dijalankan'));
    reportWorker.on('failed', (job, err) => console.error('Worker failed', err));
    */
    
    console.log('QUEUE: init done (mock)');
  } catch (e: any) {
    console.error('QUEUE: init failed', e);
    console.error(e?.stack);
  }
}

export async function closeQueue() {
  console.log('QUEUE: closeQueue called');
  try {
    if (reportWorker) await reportWorker.close();
    if (reportQueue) await reportQueue.close();
    console.log('QUEUE: closed');
  } catch (e) {
    console.error('QUEUE: close failed', e);
  }
}

export { reportQueue };