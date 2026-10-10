import { integer, pgTable, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

export const transactionCounters = pgTable("TransactionCounters", {
    id: integer("Id").primaryKey().generatedByDefaultAsIdentity({ name: "TransactionCounters_Id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647 }),
    userId: uuid("UserId").notNull(),
    counterKey: varchar("CounterKey", { length: 10 }).notNull(),
    lastSequence: integer("LastSequence").notNull(),
}, (table) => [
    uniqueIndex("IX_TransactionCounters_UserId_CounterKey").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.counterKey.asc().nullsLast().op("text_ops")),
]);