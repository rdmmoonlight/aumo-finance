// src/routes/index.ts
import { OpenAPIHono } from '@hono/zod-openapi';
import { Scalar } from '@scalar/hono-api-reference';
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
  app.route('/api/v1', apiV1);

  // udah, ini gantiin buildOpenApiSpec(app) lu yang error kemarin
  app.doc?.('/openapi.json', {
    openapi: '3.1.0',
    info: {
      title: 'Aumo Backend API',
      version: '3.2.0',
      description: 'Dokumentasi API Aumo Backend'
    },
  });

  app.get('/docs', Scalar({ url: '/openapi.json' }));
}

export { apiV1 };

