import type { Hono } from 'hono';
import type { AppEnv } from '../types/app.types.js';
import { authRoutes } from './auth.route.js';
import { healthRoutes } from './health.route.js';
import { buildOpenApiSpec, docsHtml } from './openapi.js';
import { userRoutes } from './user.route.js';

/** Pasang semua route aplikasi ke instance Hono. */
export function registerRoutes(app: Hono<AppEnv>): void {
  app.route('/', healthRoutes);
  app.route('/users', userRoutes);
  app.route('/auth', authRoutes);

  // Dokumentasi: spesifikasi dibangun dari route yang terdaftar saat request masuk
  app.get('/openapi.json', (c) => c.json(buildOpenApiSpec(app.routes)));
  app.get('/docs', (c) => c.html(docsHtml));
}
