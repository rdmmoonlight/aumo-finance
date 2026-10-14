import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { env } from '../lib/env.js';
import * as schema from './schema/index.js';

export const DRIZZLE_DB = 'DRIZZLE_DB';

export const databaseProvider = {
  provide: DRIZZLE_DB,
  useFactory: () => drizzle({ client: neon(env.DATABASE_URL), schema }),
};
