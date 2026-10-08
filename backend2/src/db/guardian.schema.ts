import { boolean, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./auth.schema";

export const sessions = pgTable("sessions", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    deviceName: varchar("device_name", { length: 100 }),
    device: varchar("device", { length: 100 }),
    operatingSystem: varchar("operating_system", { length: 100 }),
    os: varchar("os", { length: 100 }),
    browser: varchar("browser", { length: 100 }),
    ipAddress: varchar("ip_address", { length: 100 }),
    country: varchar("country", { length: 10 }),
    sessionType: varchar("session_type", { length: 50 }),
    userAgent: text("user_agent"),
    lastActivityAt: timestamp("last_activity_at").defaultNow(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    expiresAt: timestamp("expires_at"),
});

export const loginActivities = pgTable("login_activities", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    activity: varchar("activity", { length: 100 }).notNull().default("Unknown"),
    activityType: varchar("activity_type", { length: 100 }).notNull().default("Unknown"),
    deviceName: varchar("device_name", { length: 100 }),
    device: varchar("device", { length: 100 }),
    browser: varchar("browser", { length: 100 }),
    ipAddress: varchar("ip_address", { length: 100 }),
    country: varchar("country", { length: 10 }),
    success: boolean("success").notNull().default(true),
    isSuccess: boolean("is_success").notNull().default(true),
    os: varchar("os", { length: 100 }),
    operatingSystem: varchar("operating_system", { length: 100 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow(),
});