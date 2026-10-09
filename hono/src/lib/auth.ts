import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import * as schema from "../../src/db/schema/auth-schema"; // Lokasi schema di /src/db/schema/auth-schema.ts
import { db } from "../db"; // Sesuaikan path jika lokasi db.ts ada di ./db atau ./src/db/index

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema,
        // usePlural: true, // Gunakan jika Anda memakai penamaan tabel jamak
    }),
    // ...konfigurasi penyedia auth/plugin lainnya
});