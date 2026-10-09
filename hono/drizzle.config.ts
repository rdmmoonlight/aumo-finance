import "dotenv/config";
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL belum diisi di file .env");
}

export default defineConfig({
    dialect: "postgresql",

    // Daftar file eksplisit: menghindari masalah resolusi import ESM saat drizzle-kit memuat folder
    schema: [
        "./src/db/schema/auth-schema.ts",
        "./src/db/schema/chart-of-accounts.ts",
        "./src/db/schema/journal-entries.ts",
        "./src/db/schema/notifications.ts",
        "./src/db/schema/periods.ts",
        "./src/db/schema/transaction-counters.ts",
        "./src/db/schema/reports/general-ledgers.ts",
        "./src/db/schema/reports/journals.ts",
        "./src/db/schema/reports/trial-balances.ts",
        "./src/db/schema/reports/worksheet.ts",
    ],

    out: "./drizzle",

    dbCredentials: {
        url: process.env.DATABASE_URL,
    },

    strict: true,
    verbose: true,
});
