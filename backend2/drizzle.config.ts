import { defineConfig } from "drizzle-kit";
import { env } from "./src/lib/env";

export default defineConfig({
    // Tentukan dialek basis data
    dialect: "postgresql",

    // Lokasi tempat Anda menyimpan skema Drizzle (misal: src/db/schema/auth.ts)
    schema: "./src/db/schema/**/*.ts",

    // Folder tempat menyimpan output migrasi SQL yang dihasilkan
    out: "./drizzle",

    // Konfigurasi koneksi ke Neon Postgres
    dbCredentials: {
        url: env.DATABASE_URL,
    },

    // Logika tambahan untuk migrasi aman
    strict: true,
    verbose: true,
});