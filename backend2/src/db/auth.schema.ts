import { boolean, integer, pgTable, primaryKey, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { z } from 'zod';

// --- Zod ---
export const loginRequestSchema = z.object({
    email: z.string().min(1).email('Format email tidak valid'),
    password: z.string().min(1, 'Password wajib diisi'),
    rememberMe: z.boolean().optional().default(false),
    isMobileClient: z.boolean().optional().default(false),
    userAgent: z.string().optional(),
    operatingSystem: z.string().optional(),
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const googleLoginRequestSchema = z.object({
    idToken: z.string().min(1),
    isMobileClient: z.boolean().optional().default(false),
});
export type GoogleLoginRequest = z.infer<typeof googleLoginRequestSchema>;

// --- Tables ---
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
        userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
        roleId: uuid('role_id').references(() => roles.id, { onDelete: 'cascade' }).notNull(),
    },
    (t) => ({ pk: primaryKey({ columns: [t.userId, t.roleId] }) })
);

export const userClaims = pgTable('user_claims', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    claimType: varchar('claim_type', { length: 256 }).notNull(),
    claimValue: text('claim_value').notNull(),
});

export const userLogins = pgTable(
    'user_logins',
    {
        userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
        loginProvider: varchar('login_provider', { length: 100 }).notNull(),
        providerKey: varchar('provider_key', { length: 256 }).notNull(),
        providerDisplayName: varchar('provider_display_name', { length: 100 }),
    },
    (t) => ({ pk: primaryKey({ columns: [t.loginProvider, t.providerKey] }) })
);

// Wajib ada karena dipakai di auth.service logout
export const sessions = pgTable('sessions', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});