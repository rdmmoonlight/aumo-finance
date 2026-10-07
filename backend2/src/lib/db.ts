import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import pg from "pg";

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

// 1. Definisi Skema Tabel Users
export const users = pgTable("users", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    name: text("name"),
    role: varchar("role", { length: 50 }).notNull().default("user"),
    googleId: text("google_id"),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 2. Inisialisasi Drizzle dengan schema
export const db = drizzle(pool, { schema: { users } });