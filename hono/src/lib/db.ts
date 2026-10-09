
// Temporary mock schema for runtime execution
const schema = {} as any;
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
// ISOLATED TOTAL: import * as schema from "../db/schema";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is missing.");
}

export const pool = new Pool({
    connectionString,
    // Opsi pool disesuaikan untuk serverless Neon / Node.js backend
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

// Inisialisasi Drizzle dengan schema lengkap
export const db = drizzle(pool, { schema });