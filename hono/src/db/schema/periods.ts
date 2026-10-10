import { sql } from "drizzle-orm";
import { boolean, index, integer, pgTable, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

export const periods = pgTable("Periods", {
    id: integer("Id").primaryKey().generatedByDefaultAsIdentity({ name: "Periods_Id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647 }),
    periodName: varchar("PeriodName", { length: 50 }).notNull(),
    startDate: timestamp("StartDate", { withTimezone: true, mode: 'string' }).notNull(),
    endDate: timestamp("EndDate", { withTimezone: true, mode: 'string' }).notNull(),
    isClosed: boolean("IsClosed").default(false).notNull(),
    isSelected: boolean("IsSelected").default(false).notNull(),
    userId: uuid("UserId").notNull(),
}, (table) => [
    uniqueIndex("IX_Periods_IsSelected_Unique").using("btree", table.userId.asc().nullsLast().op("uuid_ops")).where(sql`("IsSelected" = true)`),
    index("IX_Periods_UserId").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
]);