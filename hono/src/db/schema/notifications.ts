import { boolean, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const notifications = pgTable("Notifications", {
    id: uuid("Id").primaryKey().notNull(),
    userId: uuid("UserId").notNull(),
    title: text("Title").notNull(),
    message: text("Message").notNull(),
    type: text("Type").notNull(),
    isRead: boolean("IsRead").notNull(),
    targetUrl: text("TargetUrl"),
    createdAt: timestamp("CreatedAt", { withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
    index("IX_Notifications_UserId_IsRead_CreatedAt").using("btree", table.userId.asc().nullsLast().op("timestamptz_ops"), table.isRead.asc().nullsLast().op("uuid_ops"), table.createdAt.asc().nullsLast().op("uuid_ops")),
]);