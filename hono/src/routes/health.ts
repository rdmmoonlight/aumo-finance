import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';

export const healthRoute = new OpenAPIHono();

// 1. GET / (Server Status)
const rootRoute = createRoute({
  method: 'get',
  path: '/',
  summary: 'API Server Status',
  description: 'Mengecek status utama server Aumo Backend',
  responses: {
    200: {
      description: 'Server online',
      content: {
        'application/json': {
          schema: z.object({
            status: z.string().openapi({ example: 'ok' }),
            message: z.string().openapi({ example: 'AumoBackend API Server Online 🚀' }),
          }),
        },
      },
    },
  },
});

healthRoute.openapi(rootRoute, (c) => {
  return c.json({ status: 'ok', message: 'AumoBackend API Server Online 🚀' }, 200);
});

// 2. HEAD / (Ping)
const headRoute = createRoute({
  method: 'head',
  path: '/',
  summary: 'Ping API Server',
  responses: {
    200: {
      description: 'Server merespon ping',
    },
  },
});

healthRoute.openapi(headRoute, (c) => {
  return c.body(null, 200);
});

// 3. GET /health (Basic Health Check)
const basicHealthRoute = createRoute({
  method: 'get',
  path: '/health',
  summary: 'Basic Health Check',
  description: 'Mengecek ketersediaan server secara umum',
  responses: {
    200: {
      description: 'Server berjalan dengan baik',
      content: {
        'application/json': {
          schema: z.object({
            status: z.string().openapi({ example: 'pass' }),
            timestamp: z.string().openapi({ example: '2026-10-09T14:00:00.000Z' }),
          }),
        },
      },
    },
  },
});

healthRoute.openapi(basicHealthRoute, (c) => {
  return c.json(
    {
      status: 'pass',
      timestamp: new Date().toISOString(),
    },
    200
  );
});
