import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema/index.js';

console.log('DB PROVIDER FILE LOADED - NO TEST MODE');

export const databaseProvider = {
  provide: 'DATABASE',
  useFactory: async () => {
    console.log('DB PROVIDER: useFactory called - NO TEST');
    try {
      const url = process.env.DATABASE_URL;
      console.log('DB PROVIDER: URL exists?', !!url);
      if (!url) throw new Error('DATABASE_URL missing');

      console.log('DB PROVIDER: Creating pool WITHOUT testing connection...');
      const pool = new Pool({ 
        connectionString: url,
        ssl: { rejectUnauthorized: false },
      });

      // Add error handler to prevent unhandled error crash
      pool.on('error', (err: any) => {
        console.error('DB POOL ERROR EVENT:', err.message);
      });

      console.log('DB PROVIDER: pool created, SKIPPING connect test');
      const db = drizzle(pool, { schema });
      console.log('DB PROVIDER: drizzle OK - returning without test');
      return db;
    } catch (e: any) {
      console.error('DB PROVIDER FAILED:', e.message);
      console.error(e?.stack);
      throw e;
    }
  },
};