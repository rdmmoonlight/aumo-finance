import { boolean, index, integer, pgTable, text, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

export const chartOfAccounts = pgTable("ChartOfAccounts", {
    id: integer("Id").primaryKey().generatedByDefaultAsIdentity({ name: "ChartOfAccounts_Id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647 }),
    referenceNumber: integer("ReferenceNumber").notNull(),
    accountName: varchar("AccountName", { length: 100 }).notNull(),
    type: text("Type").notNull(),
    role: text("Role").notNull(),
    isActive: boolean("IsActive").notNull(),
    userId: uuid("UserId").notNull(),
}, (table) => [
    index("IX_ChartOfAccounts_UserId").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
    uniqueIndex("IX_ChartOfAccounts_UserId_ReferenceNumber").using("btree", table.userId.asc().nullsLast().op("int4_ops"), table.referenceNumber.asc().nullsLast().op("int4_ops")),
]);