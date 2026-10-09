import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { sql } from 'drizzle-orm';
import { db } from '../lib/db.js';

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

// 3. GET /health (Database Health Check)
const dbHealthRoute = createRoute({
  method: 'get',
  path: '/health',
  summary: 'Database Health Check',
  description: 'Menguji koneksi langsung ke Neon Postgres',
  responses: {
    200: {
      description: 'Koneksi database berhasil',
      content: {
        'application/json': {
          schema: z.object({
            status: z.string().openapi({ example: 'pass' }),
            timestamp: z.string().openapi({ example: '2026-10-09T14:00:00.000Z' }),
            database: z.object({
              status: z.string().openapi({ example: 'up' }),
              latency: z.string().openapi({ example: '42ms' }),
              name: z.string().openapi({ example: 'aumo_db' }),
              serverTime: z.any().nullable(),
            }),
          }),
        },
      },
    },
    500: {
      description: 'Koneksi database gagal',
      content: {
        'application/json': {
          schema: z.object({
            status: z.string().openapi({ example: 'fail' }),
            timestamp: z.string().openapi({ example: '2026-10-09T14:00:00.000Z' }),
            database: z.object({
              status: z.string().openapi({ example: 'down' }),
              error: z.string().openapi({ example: 'Database connection error' }),
            }),
          }),
        },
      },
    },
  },
});

healthRoute.openapi(dbHealthRoute, async (c) => {
  try {
    const startTime = Date.now();
    const result = await db.execute(sql`SELECT NOW() as now, current_database() as db_name;`);
    const latency = `${Date.now() - startTime}ms`;

    return c.json(
      {
        status: 'pass',
        timestamp: new Date().toISOString(),
        database: {
          status: 'up',
          latency,
          name: (result.rows[0]?.db_name as string) ?? 'unknown',
          serverTime: result.rows[0]?.now ?? null,
        },
      },
      200
    );
  } catch (error) {
    return c.json(
      {
        status: 'fail',
        timestamp: new Date().toISOString(),
        database: {
          status: 'down',
          error: error instanceof Error ? error.message : 'Database connection error',
        },
      },
      500
    );
  }
});