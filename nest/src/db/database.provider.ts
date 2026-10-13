import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

export const DRIZZLE_DB = 'DRIZZLE_DB';

export const databaseProvider = {
  provide: DRIZZLE_DB,
  useFactory: () => {
    const sql = neon(process.env.DATABASE_URL!);
    return drizzle({ client: sql });
  },
};
