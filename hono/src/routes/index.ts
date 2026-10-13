import { OpenAPIHono } from '@hono/zod-openapi';
import { Scalar } from '@scalar/hono-api-reference';
import { auth } from '../lib/auth.js';
import type { AppEnv } from '../types/app.js';

import { authRoute } from './auth.js';
import { chartOfAccountsRoutes } from './chart-of-accounts';
import { generalJournalRoutes } from './general-journal';
import { healthRoute } from './health';
import { periodsRoutes } from './periods';

// Instance Hono untuk dokumentasi & routing utama OpenAPI
const appApi = new OpenAPIHono<AppEnv>();

// Daftarkan sub-routes bisnis
appApi.route('/', healthRoute);                       // GET / & GET /health
appApi.route('/auth', authRoute);                     // Custom auth endpoints
appApi.route('/periods', periodsRoutes);              // Management Periode Akuntansi
appApi.route('/chart-of-accounts', chartOfAccountsRoutes); // Chart of Accounts (COA)
appApi.route('/general-journals', generalJournalRoutes);   // Jurnal Umum & Penyesuaian

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
  // 1. CORS sudah ditangani oleh registerMiddleware (allowlist origin + credentials).
  //    Jangan pasang cors() kedua di sini: ia menimpa Access-Control-Allow-Origin
  //    menjadi '*', sehingga browser menolak respons request ber-credentials (cookie).

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

  // 6. Coming Soon / Fallback Handler
  app.notFound((c) =>
    c.json(
      {
        success: false,
        message: '🚧 ⚠️ Fitur ini sedang dalam tahap pembangunan (Coming Soon)! ⚠️ 🚧',
        code: 'FEATURE_UNDER_CONSTRUCTION',
        path: c.req.path,
      },
      404
    )
  );
}

export { appApi };

