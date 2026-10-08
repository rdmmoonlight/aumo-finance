import {
    boolean,
    integer,
    numeric,
    pgTable,
    serial,
    text,
    timestamp,
    unique,
    uuid,
    varchar,
} from "drizzle-orm/pg-core";
import { z } from "zod";
import { users } from "./auth.schema";

// ==========================================
// ZOD VALIDATION - CREATE PERIOD
// ==========================================

export const createPeriodSchema = z.discriminatedUnion('setupMode', [
    z.object({
        setupMode: z.literal('LoadExisting'),
        year: z.number().int().min(1900).max(2100),
        month: z.number().int().min(1).max(12),
        cashAccountId: z.number().int().positive().optional(),
        bankAccountId: z.number().int().positive().optional(),
        retainedEarningsAccountId: z.number().int().positive().optional()
    }),
    z.object({
        setupMode: z.literal('New'),
        year: z.number().int().min(1900, 'Tahun minimal 1900').max(2100),
        month: z.number().int().min(1).max(12),

        cashAccountCode: z.string().trim().min(1, 'Kode akun kas wajib diisi'),
        cashAccountName: z.string().trim().min(1, 'Nama akun kas wajib diisi'),
        cashBalance: z.number().min(0).optional().default(0),

        bankAccountCode: z.string().trim().min(1, 'Kode akun bank wajib diisi'),
        bankAccountName: z.string().trim().min(1, 'Nama akun bank wajib diisi'),
        bankBalance: z.number().min(0).optional().default(0),

        retainedEarningsAccountCode: z.string().trim().min(1, 'Kode akun laba ditahan wajib diisi'),
        retainedEarningsAccountName: z.string().trim().min(1, 'Nama akun laba ditahan wajib diisi')
    })
]);

export type CreatePeriodInput = z.infer<typeof createPeriodSchema>;

// ==========================================
// TABLES
// ==========================================

export const chartOfAccounts = pgTable("chart_of_accounts", {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    referenceNumber: integer("reference_number").notNull(),
    accountName: varchar("account_name", { length: 256 }).notNull(),
    type: varchar("type", { length: 100 }).notNull(), // Asset, Liability, Equity, Revenue, Expense
    role: varchar("role", { length: 100 }).default("Default"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const periods = pgTable("periods", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    periodName: varchar("period_name", { length: 100 }).notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    isClosed: boolean("is_closed").default(false).notNull(),
    isSelected: boolean("is_selected").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const journalEntries = pgTable("journal_entries", {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    transactionNumber: varchar("transaction_number", { length: 20 }).notNull().unique(),
    journalType: varchar("journal_type", { length: 50 }).notNull().default("General"),
    entryDate: timestamp("entry_date").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const journalEntryLines = pgTable("journal_entry_lines", {
    id: serial("id").primaryKey(),
    journalEntryId: integer("journal_entry_id").references(() => journalEntries.id, { onDelete: "cascade" }).notNull(),
    accountId: integer("account_id").references(() => chartOfAccounts.id, { onDelete: "restrict" }).notNull(),
    lineDescription: text("line_description"),
    debit: numeric("debit", { precision: 18, scale: 2 }).notNull().default("0"),
    credit: numeric("credit", { precision: 18, scale: 2 }).notNull().default("0"),
    lineOrder: integer("line_order").notNull().default(0),
});

export const transactionCounters = pgTable(
    "transaction_counters",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
        counterKey: varchar("counter_key", { length: 20 }).notNull(),
        lastSequence: integer("last_sequence").notNull().default(0),
        updatedAt: timestamp("updated_at").defaultNow(),
    },
    (t) => ({
        uniq: unique().on(t.userId, t.counterKey),
    })
);

export const userSettings = pgTable("user_settings", {
    userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
    selectedPeriodId: uuid("selected_period_id").references(() => periods.id),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const createPeriodRequestSchema = z.object({
    year: z.number().int().min(2000).max(2100),
    month: z.number().int().min(1).max(12),
    setupMode: z.enum(['LoadExisting', 'New']).default('New'),

    // Mode LoadExisting - pakai akun existing
    cashAccountId: z.number().int().optional(),
    bankAccountId: z.number().int().optional(),
    retainedEarningsAccountId: z.number().int().optional(),

    // Mode New - bikin akun baru
    cashAccountCode: z.string().optional(),
    bankAccountCode: z.string().optional(),
    retainedEarningsAccountCode: z.string().optional(),
    cashAccountName: z.string().optional(),
    bankAccountName: z.string().optional(),
    retainedEarningsAccountName: z.string().optional(),
    cashBalance: z.number().optional(),
    bankBalance: z.number().optional(),
});