import { Redis } from 'ioredis';
import { logger } from './logger.js';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
    // Wajib null agar kompatibel dengan BullMQ (blocking commands)
    maxRetriesPerRequest: null,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
});

redis.on('connect', () => {
    logger.info('Redis connected successfully');
});

redis.on('error', (err) => {
    logger.error({ err }, 'Redis connection error');
});