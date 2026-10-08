import { boolean, integer, pgTable, primaryKey, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

// --- Users (dari file lamamu, dipertahankan) ---
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    userName: varchar('user_name', { length: 256 }).notNull().unique(),
    email: varchar('email', { length: 256 }).notNull().unique(),
    emailConfirmed: boolean('email_confirmed').default(false).notNull(),
    passwordHash: text('password_hash').notNull(),
    fullName: varchar('full_name', { length: 256 }),
    phoneNumber: varchar('phone_number', { length: 50 }),
    avatarUrl: text('avatar_url'),
    bio: text('bio'),
    accessFailedCount: integer('access_failed_count').default(0).notNull(),
    lockoutEnd: timestamp('lockout_end', { withTimezone: true }),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const roles = pgTable('roles', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull().unique(),
});

export const userRoles = pgTable(
    'user_roles',
    {
        userId: uuid('user_id')
            .references(() => users.id, { onDelete: 'cascade' })
            .notNull(),
        roleId: uuid('role_id')
            .references(() => roles.id, { onDelete: 'cascade' })
            .notNull(),
    },
    (t) => ({ pk: primaryKey({ columns: [t.userId, t.roleId] }) })
);

export const userClaims = pgTable('user_claims', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    claimType: varchar('claim_type', { length: 256 }).notNull(),
    claimValue: text('claim_value').notNull(),
});

export const userLogins = pgTable(
    'user_logins',
    {
        userId: uuid('user_id')
            .references(() => users.id, { onDelete: 'cascade' })
            .notNull(),
        loginProvider: varchar('login_provider', { length: 100 }).notNull(),
        providerKey: varchar('provider_key', { length: 256 }).notNull(),
        providerDisplayName: varchar('provider_display_name', { length: 100 }),
    },
    (t) => ({ pk: primaryKey({ columns: [t.loginProvider, t.providerKey] }) })
);

// --- REVISI UTAMA: dari C# UserSession & LoginActivity ---

export const userSessions = pgTable('user_sessions', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    deviceName: varchar('device_name', { length: 256 }).notNull(),
    operatingSystem: varchar('operating_system', { length: 128 }).notNull(),
    browser: varchar('browser', { length: 128 }).notNull(),
    userAgent: text('user_agent').notNull(),
    ipAddress: varchar('ip_address', { length: 45 }).notNull(),
    country: varchar('country', { length: 2 }).notNull().default('ID'),
    refreshTokenHash: text('refresh_token_hash').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    isCurrent: boolean('is_current').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    lastActivityAt: timestamp('last_activity_at', { withTimezone: true }).defaultNow().notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
});

export const loginActivities = pgTable('login_activities', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    activityType: varchar('activity_type', { length: 50 }).notNull(), // LOGIN, LOGOUT, FAILED_LOGIN, GOOGLE_LOGIN
    device: varchar('device', { length: 256 }).notNull(),
    operatingSystem: varchar('operating_system', { length: 128 }).notNull(),
    userAgent: text('user_agent').notNull(),
    browser: varchar('browser', { length: 128 }).notNull(),
    ipAddress: varchar('ip_address', { length: 45 }).notNull(),
    country: varchar('country', { length: 2 }).notNull().default('ID'),
    isSuccess: boolean('is_success').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Backward compatibility untuk auth.service.ts yang masih import { sessions } ---
export const sessions = userSessions;

// --- Infer types untuk Drizzle ---
export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;

export type UserSessionRow = typeof userSessions.$inferSelect;
export type NewUserSessionRow = typeof userSessions.$inferInsert;

export type LoginActivityRow = typeof loginActivities.$inferSelect;
export type NewLoginActivityRow = typeof loginActivities.$inferInsert;
