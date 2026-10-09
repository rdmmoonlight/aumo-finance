import { sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { db } from '../lib/db.js';

export const healthRoute = new Hono();

// Root GET /
healthRoute.get('/', (c) => {
  return c.json({ status: 'ok', message: 'AumoBackend API Server Online 🚀' });
});

// Root HEAD /
healthRoute.on('HEAD', '/', (c) => {
  return c.body(null, 200);
});

// GET /health (Menguji koneksi ke Neon Postgres)
healthRoute.get('/health', async (c) => {
  try {
    const startTime = Date.now();
    const result = await db.execute(sql`SELECT NOW() as now, current_database() as db_name;`);
    const latency = `${Date.now() - startTime}ms`;

    return c.json({
      status: 'pass',
      timestamp: new Date().toISOString(),
      database: {
        status: 'up',
        latency,
        name: result.rows[0]?.db_name ?? 'unknown',
        serverTime: result.rows[0]?.now ?? null,
      },
    });
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