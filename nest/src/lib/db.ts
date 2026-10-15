import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../db/schema/index.js';

console.log('LIB/DB: Loading - NO POOL AT IMPORT');

const url = process.env.DATABASE_URL;
export let db: any = null;
export let pool: any = null;

if (!url) {
  console.error('LIB/DB: DATABASE_URL missing');
} else {
  console.log('LIB/DB: Creating lazy pool...');
  pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
  pool.on('error', (e: any) => console.error('LIB/DB pool error:', e.message));
  db = drizzle(pool, { schema });
  console.log('LIB/DB: db created (no test)');
}