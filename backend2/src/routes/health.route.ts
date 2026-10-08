import { Hono } from 'hono';
import type { AppEnv } from '../types/app.types.js';

export const healthRoutes = new Hono<AppEnv>()
  .get('/', (c) => c.json({ message: 'API berjalan lancar 🚀' }))
  .get('/health', (c) => c.json({ status: 'ok', uptime: process.uptime() }));
