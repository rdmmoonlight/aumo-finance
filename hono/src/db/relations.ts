import { relations } from "drizzle-orm";
import * as schema from "./schema/index";

// 1. Relasi User (misal: user punya banyak session / data lain)
export const userRelations = relations(schema.user, ({ many }) => ({
	sessions: many(schema.session),
	accounts: many(schema.account),
}));

export const sessionRelations = relations(schema.session, ({ one }) => ({
	user: one(schema.user, {
		fields: [schema.session.userId],
		references: [schema.user.id],
	}),
}));

export const accountRelations = relations(schema.account, ({ one }) => ({
	user: one(schema.user, {
		fields: [schema.account.userId],
		references: [schema.user.id],
	}),
}));

// 2. Relasi General Ledger Permanent Accounts
export const generalLedgerPermanentAccountsRelations = relations(
	schema.generalLedgerPermanentAccounts,
	({ one }) => ({
		chartOfAccount: one(schema.chartOfAccounts, {
			fields: [schema.generalLedgerPermanentAccounts.accountId],
			references: [schema.chartOfAccounts.id],
		}),
		journalEntry: one(schema.journalEntries, {
			fields: [schema.generalLedgerPermanentAccounts.journalEntryId],
			references: [schema.journalEntries.id],
		}),
		journalEntryLine: one(schema.journalEntryLines, {
			fields: [schema.generalLedgerPermanentAccounts.journalEntryLineId],
			references: [schema.journalEntryLines.id],
		}),
		period: one(schema.periods, {
			fields: [schema.generalLedgerPermanentAccounts.periodId],
			references: [schema.periods.id],
		}),
	})
);

// 3. Relasi General Ledger Temporary Accounts
export const generalLedgerTemporaryAccountsRelations = relations(
	schema.generalLedgerTemporaryAccounts,
	({ one }) => ({
		chartOfAccount: one(schema.chartOfAccounts, {
			fields: [schema.generalLedgerTemporaryAccounts.accountId],
			references: [schema.chartOfAccounts.id],
		}),
		journalEntry: one(schema.journalEntries, {
			fields: [schema.generalLedgerTemporaryAccounts.journalEntryId],
			references: [schema.journalEntries.id],
		}),
		journalEntryLine: one(schema.journalEntryLines, {
			fields: [schema.generalLedgerTemporaryAccounts.journalEntryLineId],
			references: [schema.journalEntryLines.id],
		}),
		period: one(schema.periods, {
			fields: [schema.generalLedgerTemporaryAccounts.periodId],
			references: [schema.periods.id],
		}),
	})
);

// 4. Relasi Chart of Accounts (Satu akun punya banyak entri di GL & Journal Entry Lines)
export const chartOfAccountsRelations = relations(
	schema.chartOfAccounts,
	({ many }) => ({
		generalLedgerPermanentAccounts: many(schema.generalLedgerPermanentAccounts),
		generalLedgerTemporaryAccounts: many(schema.generalLedgerTemporaryAccounts),
		journalEntryLines: many(schema.journalEntryLines),
	})
);

// 5. Relasi Periods
export const periodsRelations = relations(schema.periods, ({ many }) => ({
	generalLedgerPermanentAccounts: many(schema.generalLedgerPermanentAccounts),
	generalLedgerTemporaryAccounts: many(schema.generalLedgerTemporaryAccounts),
}));