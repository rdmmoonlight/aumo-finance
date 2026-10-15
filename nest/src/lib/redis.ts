import { Redis } from 'ioredis';

console.log('REDIS: Loading...');

const redisUrl = process.env.REDIS_URL;
console.log('REDIS: REDIS_URL exists?', !!redisUrl);
console.log('REDIS: REDIS_URL preview:', redisUrl ? redisUrl.substring(0, 40) + '...' : 'MISSING');

let redis: any;

if (!redisUrl) {
  console.error('REDIS: REDIS_URL missing, using mock');
  redis = {
    quit: async () => console.log('Mock redis quit'),
    on: () => {},
    ping: async () => 'PONG',
  };
} else {
  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 2,
      enableReadyCheck: false,
      connectTimeout: 5000,
      lazyConnect: true,
    });
    
    redis.on('connect', () => console.log('REDIS: connect event'));
    redis.on('ready', () => console.log('REDIS: ready event'));
    redis.on('error', (e: any) => console.error('REDIS: error event', e.message));
    redis.on('close', () => console.log('REDIS: close event'));
    
    console.log('REDIS: client created, not connecting yet (lazy)');
  } catch (e: any) {
    console.error('REDIS: creation failed', e);
    redis = {
      quit: async () => {},
      on: () => {},
      ping: async () => 'PONG',
    };
  }
}

export { redis };