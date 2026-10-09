import { sql } from "drizzle-orm";
import { integer, numeric, pgTable, serial, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const generalJournal = pgTable("GeneralJournal", {
    id: serial("Id").primaryKey().notNull(),
    journalEntryId: integer("JournalEntryId"),
    transactionNumber: varchar("TransactionNumber", { length: 255 }),
    entryDate: timestamp("EntryDate", { withTimezone: true, mode: 'string' }),
    journalType: varchar("JournalType", { length: 255 }),
    headerDescription: text("HeaderDescription"),
    status: text("Status"),
    userId: uuid("UserId"),
    lineId: integer("LineId"),
    accountId: integer("AccountId"),
    lineDescription: varchar("LineDescription", { length: 255 }),
    debit: numeric("Debit"),
    credit: numeric("Credit"),
    lineOrder: integer("LineOrder"),
    createdAt: timestamp("CreatedAt", { withTimezone: true, mode: 'string' }),
    updatedAt: timestamp("UpdatedAt", { withTimezone: true, mode: 'string' }),
});

export const adjustingJournal = pgTable("AdjustingJournal", {
    id: serial("Id").primaryKey().notNull(),
    journalEntryId: integer("JournalEntryId"),
    transactionNumber: varchar("TransactionNumber"),
    entryDate: timestamp("EntryDate", { withTimezone: true, mode: 'string' }),
    journalType: varchar("JournalType"),
    headerDescription: text("HeaderDescription"),
    status: text("Status"),
    userId: uuid("UserId"),
    lineId: integer("LineId"),
    accountId: integer("AccountId"),
    lineDescription: varchar("LineDescription"),
    debit: numeric("Debit"),
    credit: numeric("Credit"),
    lineOrder: integer("LineOrder"),
    createdAt: timestamp("CreatedAt", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("UpdatedAt", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

export const closingJournal = pgTable("ClosingJournal", {
    id: serial("Id").primaryKey().notNull(),
    journalEntryId: integer("JournalEntryId"),
    transactionNumber: varchar("TransactionNumber"),
    entryDate: timestamp("EntryDate", { withTimezone: true, mode: 'string' }),
    journalType: varchar("JournalType"),
    headerDescription: text("HeaderDescription"),
    status: text("Status"),
    userId: uuid("UserId"),
    lineId: integer("LineId"),
    accountId: integer("AccountId"),
    lineDescription: varchar("LineDescription"),
    debit: numeric("Debit"),
    credit: numeric("Credit"),
    lineOrder: integer("LineOrder"),
    createdAt: timestamp("CreatedAt", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("UpdatedAt", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});