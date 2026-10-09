import {
    integer,
    numeric,
    pgTable,
    serial,
    text,
    timestamp,
    uuid,
    varchar
} from 'drizzle-orm/pg-core';

export const generalJournal = pgTable('GeneralJournal', {
    id: serial('Id').primaryKey(),
    journalEntryId: integer('JournalEntryId'),
    transactionNumber: varchar('TransactionNumber', { length: 255 }),
    entryDate: timestamp('EntryDate', { withTimezone: true }),
    journalType: varchar('JournalType', { length: 255 }),
    headerDescription: text('HeaderDescription'),
    status: text('Status'),
    userId: uuid('UserId'),
    lineId: integer('LineId'),
    accountId: integer('AccountId'),
    lineDescription: varchar('LineDescription', { length: 255 }),
    debit: numeric('Debit'),
    credit: numeric('Credit'),
    lineOrder: integer('LineOrder'),
    createdAt: timestamp('CreatedAt', { withTimezone: true }),
    updatedAt: timestamp('UpdatedAt', { withTimezone: true }),
});

export type GeneralJournal = typeof generalJournal.$inferSelect;
export type NewGeneralJournal = typeof generalJournal.$inferInsert;