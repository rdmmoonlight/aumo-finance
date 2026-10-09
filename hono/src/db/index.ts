import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
// TEMP_DISABLED: import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema });
export * from "./schema/auth-schema";

export * from "./schema/chart-of-accounts.schema";
export * from "./schema/index";
export * from "./schema/reports/general-journal.schema";
