import { sql } from "drizzle-orm";
import { date, numeric, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const worksheet = pgTable("Worksheet", {
    id: serial("Id").primaryKey().notNull(),
    periodDate: date("PeriodDate"),
    accountNumber: varchar("AccountNumber", { length: 50 }).notNull(),
    accountName: varchar("AccountName", { length: 255 }).notNull(),
    trialBalanceDebit: numeric("TrialBalanceDebit", { precision: 18, scale: 2 }).default('0'),
    trialBalanceCredit: numeric("TrialBalanceCredit", { precision: 18, scale: 2 }).default('0'),
    adjustingJournalDebit: numeric("AdjustingJournalDebit", { precision: 18, scale: 2 }).default('0'),
    adjustingJournalCredit: numeric("AdjustingJournalCredit", { precision: 18, scale: 2 }).default('0'),
    trialBalanceAdjustedDebit: numeric("TrialBalanceAdjustedDebit", { precision: 18, scale: 2 }).default('0'),
    trialBalanceAdjustedCredit: numeric("TrialBalanceAdjustedCredit", { precision: 18, scale: 2 }).default('0'),
    incomeStatementDebit: numeric("IncomeStatementDebit", { precision: 18, scale: 2 }).default('0'),
    incomeStatementCredit: numeric("IncomeStatementCredit", { precision: 18, scale: 2 }).default('0'),
    financialPositionDebit: numeric("FinancialPositionDebit", { precision: 18, scale: 2 }).default('0'),
    financialPositionCredit: numeric("FinancialPositionCredit", { precision: 18, scale: 2 }).default('0'),
    createdAt: timestamp("CreatedAt", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("UpdatedAt", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});