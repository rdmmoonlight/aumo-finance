import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  // Daftar file eksplisit: menghindari masalah resolusi import ESM saat drizzle-kit memuat folder
  schema: ['./src/db/schema/auth.ts'],
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  strict: true,
  verbose: true,
});
