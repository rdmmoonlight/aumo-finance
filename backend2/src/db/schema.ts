import { relations } from "drizzle-orm";
import {
    boolean,
    integer,
    numeric,
    pgTable,
    primaryKey,
    serial,
    text,
    timestamp,
    unique,
    uuid,
    varchar,
} from "drizzle-orm/pg-core";

// ==========================================
// 1. IDENTITY & USER MANAGEMENT
// ==========================================

// Schema
const registerSchema = z.object({
    email: z.string().email('Format email tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    name: z.string().optional(),
    clientType: z.enum(['web', 'mobile']).optional().default('web'),
});

const loginSchema = z.object({
    email: z.string().email('Format email tidak valid'),
    password: z.string().min(1, 'Password wajib diisi'),
    clientType: z.enum(['web', 'mobile']).optional().default('web'),
});

export const CreateUserSchema = z.object({
    name: z.string().min(3, 'Nama minimal 3 karakter'),
    email: z.string().email('Format email tidak valid'),
    age: z.number().int().min(17, 'Umur minimal 17 tahun').optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    userName: varchar("user_name", { length: 256 }).notNull().unique(),
    email: varchar("email", { length: 256 }).notNull().unique(),
    emailConfirmed: boolean("email_confirmed").default(false),
    passwordHash: text("password_hash").notNull(), // bcrypt hash
    fullName: varchar("full_name", { length: 256 }),
    phoneNumber: varchar("phone_number", { length: 50 }),
    role: varchar("role", { length: 50 }).notNull().default("user"),
    googleId: text("google_id"),
    avatarUrl: text("avatar_url"),
    bio: text("bio"),
    accessFailedCount: integer("access_failed_count").default(0),
    lockoutEnd: timestamp("lockout_end"),
    lastLoginAt: timestamp("last_login_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const roles = pgTable("roles", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull().unique(),
});

export const userRoles = pgTable(
    "user_roles",
    {
        userId: uuid("user_id")
            .references(() => users.id, { onDelete: "cascade" })
            .notNull(),
        roleId: uuid("role_id")
            .references(() => roles.id, { onDelete: "cascade" })
            .notNull(),
    },
    (t) => ({
        pk: primaryKey({ columns: [t.userId, t.roleId] }),
    })
);

export const userClaims = pgTable("user_claims", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .references(() => users.id, { onDelete: "cascade" })
        .notNull(),
    claimType: varchar("claim_type", { length: 256 }).notNull(),
    claimValue: text("claim_value").notNull(),
});

export const userLogins = pgTable(
    "user_logins",
    {
        userId: uuid("user_id")
            .references(() => users.id, { onDelete: "cascade" })
            .notNull(),
        loginProvider: varchar("login_provider", { length: 100 }).notNull(),
        providerKey: varchar("provider_key", { length: 256 }).notNull(),
        providerDisplayName: varchar("provider_display_name", { length: 100 }),
    },
    (t) => ({
        pk: primaryKey({ columns: [t.loginProvider, t.providerKey] }),
    })
);

// ==========================================
// 2. GUARDIAN / SESSION & LOGS - UPDATED
// Supports both legacy (os, activity, success) and new (operatingSystem, activityType, isSuccess)
// ==========================================

export const sessions = pgTable("sessions", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .references(() => users.id, { onDelete: "cascade" })
        .notNull(),
    deviceName: varchar("device_name", { length: 100 }),
    device: varchar("device", { length: 100 }), // alias for compatibility
    // operatingSystem is canonical, os kept for backward compat
    operatingSystem: varchar("operating_system", { length: 100 }),
    os: varchar("os", { length: 100 }),
    browser: varchar("browser", { length: 100 }),
    ipAddress: varchar("ip_address", { length: 100 }),
    country: varchar("country", { length: 10 }),
    sessionType: varchar("session_type", { length: 50 }), // JWT_BEARER / COOKIE_SESSION
    userAgent: text("user_agent"),
    lastActivityAt: timestamp("last_activity_at").defaultNow(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    expiresAt: timestamp("expires_at"),
});

export const loginActivities = pgTable("login_activities", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .references(() => users.id, { onDelete: "cascade" })
        .notNull(),
    // legacy + new fields for compatibility with all services
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

// ==========================================
// 3. ACCOUNTING & FINANCIAL TABLES - UPDATED
// ==========================================

export const chartOfAccounts = pgTable("chart_of_accounts", {
    id: serial("id").primaryKey(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    referenceNumber: integer("reference_number").notNull(),
    accountName: varchar("account_name", { length: 256 }).notNull(),
    type: varchar("type", { length: 100 }).notNull(), // Asset, Liability, Equity, Revenue, Expense
    role: varchar("role", { length: 100 }).default("Default"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const periods = pgTable("periods", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    periodName: varchar("period_name", { length: 100 }).notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    isClosed: boolean("is_closed").default(false).notNull(),
    isSelected: boolean("is_selected").default(false).notNull(), // untuk SummaryService & dashboard
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const journalEntries = pgTable("journal_entries", {
    id: serial("id").primaryKey(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    transactionNumber: varchar("transaction_number", { length: 20 }).notNull().unique(),
    journalType: varchar("journal_type", { length: 50 }).notNull().default("General"), // General, Adjusting
    entryDate: timestamp("entry_date").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const journalEntryLines = pgTable("journal_entry_lines", {
    id: serial("id").primaryKey(),
    journalEntryId: integer("journal_entry_id")
        .references(() => journalEntries.id, { onDelete: "cascade" })
        .notNull(),
    accountId: integer("account_id")
        .references(() => chartOfAccounts.id, { onDelete: "restrict" })
        .notNull(),
    lineDescription: text("line_description"),
    debit: numeric("debit", { precision: 18, scale: 2 }).notNull().default("0"),
    credit: numeric("credit", { precision: 18, scale: 2 }).notNull().default("0"),
    lineOrder: integer("line_order").notNull().default(0),
});

// UPDATED: tambah id primary key biar bisa di-update by id (dipakai di tools.service.ts)
export const transactionCounters = pgTable(
    "transaction_counters",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        counterKey: varchar("counter_key", { length: 20 }).notNull(), // GJ2505, AJ2505
        lastSequence: integer("last_sequence").notNull().default(0),
        updatedAt: timestamp("updated_at").defaultNow(),
    },
    (t) => ({
        uniq: unique().on(t.userId, t.counterKey),
    })
);

export const userSettings = pgTable("user_settings", {
    userId: uuid("user_id")
        .primaryKey()
        .references(() => users.id, { onDelete: "cascade" }),
    selectedPeriodId: uuid("selected_period_id").references(() => periods.id),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// ==========================================
// 4. NOTIFICATIONS - NEW TABLE (dipakai di notifications.service.ts)
// ==========================================

export const notifications = pgTable("notifications", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 256 }).notNull(),
    message: text("message").notNull(),
    type: varchar("type", { length: 50 }).notNull().default("info"), // info, warning, success, error
    isRead: boolean("is_read").notNull().default(false),
    targetUrl: text("target_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// ==========================================
// 5. DRIZZLE RELATIONS
// ==========================================

export const usersRelations = relations(users, ({ many, one }) => ({
    roles: many(userRoles),
    claims: many(userClaims),
    logins: many(userLogins),
    sessions: many(sessions),
    loginActivities: many(loginActivities),
    chartOfAccounts: many(chartOfAccounts),
    periods: many(periods),
    journalEntries: many(journalEntries),
    notifications: many(notifications),
    settings: one(userSettings, {
        fields: [users.id],
        references: [userSettings.userId],
    }),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
    user: one(users, { fields: [userRoles.userId], references: [users.id] }),
    role: one(roles, { fields: [userRoles.roleId], references: [roles.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const loginActivitiesRelations = relations(loginActivities, ({ one }) => ({
    user: one(users, { fields: [loginActivities.userId], references: [users.id] }),
}));

export const chartOfAccountsRelations = relations(chartOfAccounts, ({ many, one }) => ({
    user: one(users, { fields: [chartOfAccounts.userId], references: [users.id] }),
    journalLines: many(journalEntryLines),
}));

export const periodsRelations = relations(periods, ({ one }) => ({
    user: one(users, { fields: [periods.userId], references: [users.id] }),
}));

export const journalEntriesRelations = relations(journalEntries, ({ many, one }) => ({
    user: one(users, { fields: [journalEntries.userId], references: [users.id] }),
    lines: many(journalEntryLines),
}));

export const journalEntryLinesRelations = relations(journalEntryLines, ({ one }) => ({
    journalEntry: one(journalEntries, {
        fields: [journalEntryLines.journalEntryId],
        references: [journalEntries.id],
    }),
    account: one(chartOfAccounts, {
        fields: [journalEntryLines.accountId],
        references: [chartOfAccounts.id],
    }),
}));

export const transactionCountersRelations = relations(transactionCounters, ({ one }) => ({
    user: one(users, { fields: [transactionCounters.userId], references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
    user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
    user: one(users, { fields: [userSettings.userId], references: [users.id] }),
    selectedPeriod: one(periods, {
        fields: [userSettings.selectedPeriodId],
        references: [periods.id],
    }),
}));
