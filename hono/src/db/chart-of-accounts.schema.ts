import { boolean, integer, pgTable, serial, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
// ISOLATED TOTAL: import { users } from './auth.schema';
const users = {} as any;

// ==========================================
// 1. Table: chart_of_accounts
// Converted from C# ChartOfAccount
// Balance & DisplayLabel = [NotMapped] -> tidak disimpan di DB
// ==========================================

export const chartOfAccounts = pgTable('chart_of_accounts', {
    id: serial('id').primaryKey(), // C# int Id
    referenceNumber: integer('reference_number').notNull(), // [Required]
    userId: uuid('user_id')
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    accountName: varchar('account_name', { length: 100 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(), // Assets, Liabilities, Equity, OperatingIncome, etc.
    role: varchar('role', { length: 100 }).notNull(), // System role
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Infer
export type ChartOfAccountRow = typeof chartOfAccounts.$inferSelect;
export type NewChartOfAccountRow = typeof chartOfAccounts.$inferInsert;

// ==========================================
// 2. Computed fields (pengganti [NotMapped])
// ==========================================

export type ChartOfAccountWithComputed = ChartOfAccountRow & {
    balance: number; // computed dari journal
    displayLabel: string; // `${referenceNumber} - ${accountName}`
};

export function toChartOfAccountWithComputed(
    row: ChartOfAccountRow,
    balance = 0
): ChartOfAccountWithComputed {
    return {
        ...row,
        balance,
        displayLabel: `${row.referenceNumber} - ${row.accountName}`,
    };
}
