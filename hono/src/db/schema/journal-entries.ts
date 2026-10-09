import { foreignKey, index, integer, numeric, pgTable, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { chartOfAccounts } from "./chart-of-accounts";

// Sumber: EF Core ModelSnapshot (backend/Migrations) - tabel JournalEntries & JournalEntryLines.
export const journalEntries = pgTable("JournalEntries", {
    id: integer("Id").primaryKey().generatedByDefaultAsIdentity({ name: "JournalEntries_Id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647 }),
    userId: uuid("UserId").notNull(),
    transactionNumber: varchar("TransactionNumber", { length: 30 }).notNull(),
    journalType: varchar("JournalType", { length: 50 }).notNull(),
    entryDate: timestamp("EntryDate", { withTimezone: true, mode: "string" }).notNull(),
    createdAt: timestamp("CreatedAt", { withTimezone: true, mode: "string" }).notNull(),
    updatedAt: timestamp("UpdatedAt", { withTimezone: true, mode: "string" }),
}, (table) => [
    uniqueIndex("IX_JournalEntries_UserId_TransactionNumber").using("btree", table.userId.asc().nullsLast(), table.transactionNumber.asc().nullsLast()),
]);

export const journalEntryLines = pgTable("JournalEntryLines", {
    id: integer("Id").primaryKey().generatedByDefaultAsIdentity({ name: "JournalEntryLines_Id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647 }),
    journalEntryId: integer("JournalEntryId").notNull(),
    accountId: integer("AccountId").notNull(),
    lineDescription: varchar("LineDescription", { length: 250 }),
    debit: numeric("Debit", { precision: 18, scale: 2 }).notNull(),
    credit: numeric("Credit", { precision: 18, scale: 2 }).notNull(),
    lineOrder: integer("LineOrder").notNull(),
}, (table) => [
    index("IX_JournalEntryLines_AccountId").using("btree", table.accountId.asc().nullsLast()),
    index("IX_JournalEntryLines_JournalEntryId").using("btree", table.journalEntryId.asc().nullsLast()),
    foreignKey({
        columns: [table.journalEntryId],
        foreignColumns: [journalEntries.id],
        name: "FK_JournalEntryLines_JournalEntries_JournalEntryId",
    }).onDelete("cascade"),
    foreignKey({
        columns: [table.accountId],
        foreignColumns: [chartOfAccounts.id],
        name: "FK_JournalEntryLines_ChartOfAccounts_AccountId",
    }).onDelete("restrict"),
]);
