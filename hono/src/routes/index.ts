import { OpenAPIHono } from '@hono/zod-openapi';
import { Scalar } from '@scalar/hono-api-reference';
import { cors } from 'hono/cors';
import { auth } from '../lib/auth.js';
import type { AppEnv } from '../types/app.types.js';

import { authRoute } from './auth.js';
import { getAvatarHandler } from './avatar-route.js';
import { healthRoute } from './health.js';
import { periodsRoute } from './periods.js';

// Instance Hono untuk dokumentasi & routing utama OpenAPI
const appApi = new OpenAPIHono<AppEnv>();

// Daftarkan sub-routes bisnis
appApi.route('/', healthRoute);          // GET / & GET /health
appApi.route('/auth', authRoute);        // Custom auth endpoints (jika ada)
appApi.route('/periods', periodsRoute);  // GET /periods/...
appApi.get('/avatars/:fileName', getAvatarHandler);

// Spec OpenAPI
appApi.doc('/openapi.json', {
  openapi: '3.1.0',
  info: {
    title: 'Aumo Backend API',
    version: '3.2.0',
    description: 'Dokumentasi API Aumo Backend',
  },
});

export function registerRoutes(app: OpenAPIHono<AppEnv>): void {
  // 1. CORS Middleware
  app.use(
    '*',
    cors({
      origin: '*',
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization', 'Cookie'],
      credentials: true,
    })
  );

  // 2. Direct Better Auth Handler Catch-All
  // Menangani seluruh bawaan Better Auth (/api/auth/sign-in/email, /api/auth/get-session, dll.)
  app.on(['POST', 'GET'], '/api/auth/*', (c) => {
    return auth.handler(c.req.raw);
  });

  // 3. Health Check Root
  app.get('/', (c) =>
    c.json({
      success: true,
      message: 'Aumo Backend API Running 🚀',
      version: '3.2.0',
      docs: '/docs',
    })
  );

  // 4. Mount OpenAPI Sub-routes
  app.route('/', appApi);

  // 5. UI Scalar
  app.get(
    '/docs',
    Scalar({
      spec: {
        url: '/openapi.json',
      },
      pageTitle: 'Aumo Backend API Reference 🚀',
    })
  );

  // 6. Not Found Handler
  app.notFound((c) =>
    c.json({ success: false, message: 'Route tidak ditemukan' }, 404)
  );
}

export { appApi };

