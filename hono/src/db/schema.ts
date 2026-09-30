import { pgTable, integer, varchar, timestamp, boolean, uuid } from 'drizzle-orm/pg-core';

export const periodsTable = pgTable('Periods', {
  id: integer('Id').primaryKey().generatedAlwaysAsIdentity(),
  periodName: varchar('PeriodName', { length: 255 }).notNull(),
  startDate: timestamp('StartDate', { withTimezone: true }).notNull(),
  endDate: timestamp('EndDate', { withTimezone: true }).notNull(),
  isClosed: boolean('IsClosed').notNull().default(false),
  isSelected: boolean('IsSelected').notNull().default(false),
  userId: uuid('UserId').notNull(),
});

export type PeriodSelect = typeof periodsTable.$inferSelect;
