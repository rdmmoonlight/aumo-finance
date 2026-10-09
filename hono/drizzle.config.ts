import { defineConfig } from "drizzle-kit";
import { env } from "./src/lib/env";

export default defineConfig({
    // Dialek basis data
    dialect: "postgresql",

    // Menunjuk ke file orchestrator utama (schema.ts)
    // Drizzle akan otomatis membaca seluruh skema dan relasi yang di-export di sana
    schema: "./src/db/schema.ts",

    // Folder penyimpanan file migrasi SQL
    out: "./drizzle",

    // Konfigurasi koneksi ke Neon Postgres
    dbCredentials: {
        url: env.DATABASE_URL,
    },

    // Logika tambahan untuk migrasi aman
    strict: true,
    verbose: true,
});