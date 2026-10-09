import { OpenAPIHono } from '@hono/zod-openapi';
import { Scalar } from '@scalar/hono-api-reference';
import { cors } from 'hono/cors';
import type { AppEnv } from '../types/app.types.js';

import { authRoute } from './auth.route.js';
import { getAvatarHandler } from './avatar-route.js';
import { healthRoute } from './health.route.js';
import { periodsRoute } from './periods.route.js';

const apiV1 = new OpenAPIHono<AppEnv>();

apiV1.route('/health', healthRoute);
apiV1.route('/auth', authRoute);
apiV1.route('/periods', periodsRoute);
apiV1.get('/avatars/:fileName', getAvatarHandler);

export function registerRoutes(app: OpenAPIHono<AppEnv>): void {
  // 1. Tambahkan CORS agar browser tidak memblokir request lokal ke spec
  app.use('*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  }));

  // Root info endpoint
  app.get('/', (c) =>
    c.json({
      success: true,
      message: 'Aumo Backend API Running 🚀',
      version: '3.2.0',
      docs: '/docs',
    })
  );

  app.route('/api/v1', apiV1);

  // 2. Dokumentasi OpenAPI Spec
  app.doc('/openapi.json', {
    openapi: '3.1.0',
    info: {
      title: 'Aumo Backend API',
      version: '3.2.0',
      description: 'Dokumentasi API Aumo Backend',
    },
  });

  // 3. UI Scalar dengan penyesuaian specUrl
  app.get(
    '/docs',
    Scalar({
      spec: {
        url: '/openapi.json',
      },
    })
  );

  app.notFound((c) =>
    c.json({ success: false, message: 'Route tidak ditemukan' }, 404)
  );
}

export { apiV1 };
