import { foreignKey, index, integer, numeric, pgTable, serial, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { chartOfAccounts } from "../chart-of-accounts";
import { periods } from "../periods";
import { journalEntries, journalEntryLines } from "../journal-entries";

export const generalLedgerPermanentAccounts = pgTable("GeneralLedgerPermanentAccounts", {
    id: serial("Id").primaryKey().notNull(),
    userId: uuid("UserId").notNull(),
    periodId: integer("PeriodId").notNull(),
    accountId: integer("AccountId").notNull(),
    journalEntryId: integer("JournalEntryId").notNull(),
    journalEntryLineId: integer("JournalEntryLineId").notNull(),
    entryDate: timestamp("EntryDate", { withTimezone: true, mode: 'string' }).notNull(),
    transactionNumber: varchar("TransactionNumber", { length: 255 }).notNull(),
    lineDescription: text("LineDescription"),
    debit: numeric("Debit", { precision: 18, scale: 2 }).default('0.00').notNull(),
    credit: numeric("Credit", { precision: 18, scale: 2 }).default('0.00').notNull(),
    runningBalance: numeric("RunningBalance", { precision: 18, scale: 2 }).default('0.00').notNull(),
}, (table) => [
    index("idx_pagl_user_period_account").using("btree", table.userId.asc().nullsLast().op("int4_ops"), table.periodId.asc().nullsLast().op("int4_ops"), table.accountId.asc().nullsLast().op("uuid_ops")),
    foreignKey({
        columns: [table.periodId],
        foreignColumns: [periods.id],
        name: "fk_pagl_period"
    }).onDelete("cascade"),
    foreignKey({
        columns: [table.accountId],
        foreignColumns: [chartOfAccounts.id],
        name: "fk_pagl_account"
    }).onDelete("restrict"),
    foreignKey({
        columns: [table.journalEntryId],
        foreignColumns: [journalEntries.id],
        name: "fk_pagl_journal_entry"
    }).onDelete("cascade"),
    foreignKey({
        columns: [table.journalEntryLineId],
        foreignColumns: [journalEntryLines.id],
        name: "fk_pagl_journal_entry_line"
    }).onDelete("cascade"),
]);

export const generalLedgerTemporaryAccounts = pgTable("GeneralLedgerTemporaryAccounts", {
    id: serial("Id").primaryKey().notNull(),
    userId: uuid("UserId").notNull(),
    periodId: integer("PeriodId").notNull(),
    accountId: integer("AccountId").notNull(),
    journalEntryId: integer("JournalEntryId").notNull(),
    journalEntryLineId: integer("JournalEntryLineId").notNull(),
    entryDate: timestamp("EntryDate", { withTimezone: true, mode: 'string' }).notNull(),
    transactionNumber: varchar("TransactionNumber", { length: 255 }).notNull(),
    lineDescription: text("LineDescription"),
    debit: numeric("Debit", { precision: 18, scale: 2 }).default('0.00').notNull(),
    credit: numeric("Credit", { precision: 18, scale: 2 }).default('0.00').notNull(),
    runningBalance: numeric("RunningBalance", { precision: 18, scale: 2 }).default('0.00').notNull(),
}, (table) => [
    index("idx_tagl_user_period_account").using("btree", table.userId.asc().nullsLast().op("uuid_ops"), table.periodId.asc().nullsLast().op("int4_ops"), table.accountId.asc().nullsLast().op("uuid_ops")),
    foreignKey({
        columns: [table.journalEntryLineId],
        foreignColumns: [journalEntryLines.id],
        name: "fk_tagl_journal_entry_line"
    }).onDelete("cascade"),
    foreignKey({
        columns: [table.periodId],
        foreignColumns: [periods.id],
        name: "fk_tagl_period"
    }).onDelete("cascade"),
    foreignKey({
        columns: [table.accountId],
        foreignColumns: [chartOfAccounts.id],
        name: "fk_tagl_account"
    }).onDelete("restrict"),
    foreignKey({
        columns: [table.journalEntryId],
        foreignColumns: [journalEntries.id],
        name: "fk_tagl_journal_entry"
    }).onDelete("cascade"),
]);