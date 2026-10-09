import { OpenAPIHono } from '@hono/zod-openapi';
import { Scalar } from '@scalar/hono-api-reference';
import { cors } from 'hono/cors';
import type { AppEnv } from '../types/app.types.js';

import { authRoute } from './auth.js';
import { getAvatarHandler } from './avatar-route.js';
import { healthRoute } from './health.js';
import { periodsRoute } from './periods.js';

// Instance Hono untuk dokumentasi & routing utama
const appApi = new OpenAPIHono<AppEnv>();

// Daftarkan sub-routes langsung di root
appApi.route('/', healthRoute);          // GET / & GET /health
appApi.route('/auth', authRoute);        // POST /auth/...
appApi.route('/periods', periodsRoute);  // GET /periods/...
appApi.get('/avatars/:fileName', getAvatarHandler);

// 1. Spec OpenAPI (Langsung di root /openapi.json)
appApi.doc('/openapi.json', {
  openapi: '3.1.0',
  info: {
    title: 'Aumo Backend API',
    version: '3.2.0',
    description: 'Dokumentasi API Aumo Backend',
  },
});

export function registerRoutes(app: OpenAPIHono<AppEnv>): void {
  // CORS Middleware
  app.use(
    '*',
    cors({
      origin: '*',
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    })
  );

  app.get('/', (c) =>
    c.json({
      success: true,
      message: 'Aumo Backend API Running 🚀',
      version: '3.2.0',
      docs: '/docs',
    })
  );

  // Mount appApi langsung tanpa prefix /api/v1
  app.route('/', appApi);

  // 2. UI Scalar (Arahkan langsung ke /openapi.json)
  app.get(
    '/docs',
    Scalar({
      spec: {
        url: '/openapi.json',
      },
      pageTitle: 'Aumo Backend API Reference 🚀',
    })
  );

  app.notFound((c) =>
    c.json({ success: false, message: 'Route tidak ditemukan' }, 404)
  );
}

export { appApi };

