import { Hono } from 'hono';
import { registerMiddleware } from './middleware/index.js';
import { registerRoutes } from './routes/index.js';
import type { AppEnv } from './types/app.types.js';

/** Factory aplikasi Hono (terpisah dari server agar mudah dites). */
export function createApp(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();

  registerMiddleware(app);
  registerRoutes(app);

  return app;
}
