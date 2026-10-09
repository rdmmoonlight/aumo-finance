import { relations } from "drizzle-orm/relations";
import { chartOfAccounts, journalEntryLines, journalEntries, periods, generalLedgerPermanentAccounts, generalLedgerTemporaryAccounts } from "./schema";

export const journalEntryLinesRelations = relations(journalEntryLines, ({one, many}) => ({
	chartOfAccount: one(chartOfAccounts, {
		fields: [journalEntryLines.accountId],
		references: [chartOfAccounts.id]
	}),
	journalEntry: one(journalEntries, {
		fields: [journalEntryLines.journalEntryId],
		references: [journalEntries.id]
	}),
	generalLedgerPermanentAccounts: many(generalLedgerPermanentAccounts),
	generalLedgerTemporaryAccounts: many(generalLedgerTemporaryAccounts),
}));

export const chartOfAccountsRelations = relations(chartOfAccounts, ({many}) => ({
	journalEntryLines: many(journalEntryLines),
	generalLedgerPermanentAccounts: many(generalLedgerPermanentAccounts),
	generalLedgerTemporaryAccounts: many(generalLedgerTemporaryAccounts),
}));

export const journalEntriesRelations = relations(journalEntries, ({many}) => ({
	journalEntryLines: many(journalEntryLines),
	generalLedgerPermanentAccounts: many(generalLedgerPermanentAccounts),
	generalLedgerTemporaryAccounts: many(generalLedgerTemporaryAccounts),
}));

export const generalLedgerPermanentAccountsRelations = relations(generalLedgerPermanentAccounts, ({one}) => ({
	period: one(periods, {
		fields: [generalLedgerPermanentAccounts.periodId],
		references: [periods.id]
	}),
	chartOfAccount: one(chartOfAccounts, {
		fields: [generalLedgerPermanentAccounts.accountId],
		references: [chartOfAccounts.id]
	}),
	journalEntry: one(journalEntries, {
		fields: [generalLedgerPermanentAccounts.journalEntryId],
		references: [journalEntries.id]
	}),
	journalEntryLine: one(journalEntryLines, {
		fields: [generalLedgerPermanentAccounts.journalEntryLineId],
		references: [journalEntryLines.id]
	}),
}));

export const periodsRelations = relations(periods, ({many}) => ({
	generalLedgerPermanentAccounts: many(generalLedgerPermanentAccounts),
	generalLedgerTemporaryAccounts: many(generalLedgerTemporaryAccounts),
}));

export const generalLedgerTemporaryAccountsRelations = relations(generalLedgerTemporaryAccounts, ({one}) => ({
	journalEntryLine: one(journalEntryLines, {
		fields: [generalLedgerTemporaryAccounts.journalEntryLineId],
		references: [journalEntryLines.id]
	}),
	period: one(periods, {
		fields: [generalLedgerTemporaryAccounts.periodId],
		references: [periods.id]
	}),
	chartOfAccount: one(chartOfAccounts, {
		fields: [generalLedgerTemporaryAccounts.accountId],
		references: [chartOfAccounts.id]
	}),
	journalEntry: one(journalEntries, {
		fields: [generalLedgerTemporaryAccounts.journalEntryId],
		references: [journalEntries.id]
	}),
}));