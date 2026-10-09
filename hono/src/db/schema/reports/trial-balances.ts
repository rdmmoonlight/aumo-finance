import { sql } from "drizzle-orm";
import { integer, numeric, pgTable, serial, timestamp, unique, uuid } from "drizzle-orm/pg-core";

export const trialBalanceAdjusted = pgTable("TrialBalanceAdjusted", {
    id: serial("Id").primaryKey().notNull(),
    userId: uuid("UserId").notNull(),
    periodId: integer("PeriodId").notNull(),
    accountId: integer("AccountId").notNull(),
    endingDebit: numeric("EndingDebit", { precision: 18, scale: 2 }).default('0').notNull(),
    endingCredit: numeric("EndingCredit", { precision: 18, scale: 2 }).default('0').notNull(),
    createdAt: timestamp("CreatedAt", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("UpdatedAt", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
    unique("UQ_TB_Adjusted_User_Period_Account").on(table.userId, table.periodId, table.accountId),
]);

export const trialBalancePostClosing = pgTable("TrialBalancePostClosing", {
    id: serial("Id").primaryKey().notNull(),
    userId: uuid("UserId").notNull(),
    periodId: integer("PeriodId").notNull(),
    accountId: integer("AccountId").notNull(),
    endingDebit: numeric("EndingDebit", { precision: 18, scale: 2 }).default('0').notNull(),
    endingCredit: numeric("EndingCredit", { precision: 18, scale: 2 }).default('0').notNull(),
    createdAt: timestamp("CreatedAt", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("UpdatedAt", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
    unique("UQ_TB_PostClosing_User_Period_Account").on(table.userId, table.periodId, table.accountId),
]);

export const trialBalance = pgTable("TrialBalance", {
    id: serial("Id").primaryKey().notNull(),
    userId: uuid("UserId").notNull(),
    periodId: integer("PeriodId").notNull(),
    accountId: integer("AccountId").notNull(),
    endingDebit: numeric("EndingDebit", { precision: 18, scale: 2 }).default('0').notNull(),
    endingCredit: numeric("EndingCredit", { precision: 18, scale: 2 }).default('0').notNull(),
    createdAt: timestamp("CreatedAt", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("UpdatedAt", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
    unique("UQ_TB_Unadjusted_User_Period_Account").on(table.userId, table.periodId, table.accountId),
]);