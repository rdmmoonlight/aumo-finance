// Tambahkan ini ke src/db/schema.ts kamu
// Ini adalah schema Drizzle yang menggantikan ApplicationUser + Identity tables

import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, primaryKey, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: uuid('id').primaryKey(),
    userName: varchar('user_name', { length: 256 }).notNull().unique(),
    email: varchar('email', { length: 256 }).notNull().unique(),
    emailConfirmed: boolean('email_confirmed').default(false),
    passwordHash: text('password_hash').notNull(), // bcrypt hash
    fullName: varchar('full_name', { length: 256 }),
    phoneNumber: varchar('phone_number', { length: 50 }),
    avatarUrl: text('avatar_url'),
    bio: text('bio'),
    accessFailedCount: integer('access_failed_count').default(0),
    lockoutEnd: timestamp('lockout_end'),
    lastLoginAt: timestamp('last_login_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const roles = pgTable('roles', {
    id: uuid('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull().unique(),
});

export const userRoles = pgTable('user_roles', {
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    roleId: uuid('role_id').references(() => roles.id, { onDelete: 'cascade' }).notNull(),
}, (t) => ({
    pk: primaryKey({ columns: [t.userId, t.roleId] })
}));

export const userClaims = pgTable('user_claims', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    claimType: varchar('claim_type', { length: 256 }).notNull(),
    claimValue: text('claim_value').notNull(),
});

export const userLogins = pgTable('user_logins', {
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    loginProvider: varchar('login_provider', { length: 100 }).notNull(),
    providerKey: varchar('provider_key', { length: 256 }).notNull(),
    providerDisplayName: varchar('provider_display_name', { length: 100 }),
}, (t) => ({
    pk: primaryKey({ columns: [t.loginProvider, t.providerKey] })
}));

// Guardian tables - pengganti IGuardianService C#
export const sessions = pgTable('sessions', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    deviceName: varchar('device_name', { length: 100 }),
    os: varchar('os', { length: 100 }),
    browser: varchar('browser', { length: 100 }),
    ipAddress: varchar('ip_address', { length: 100 }),
    country: varchar('country', { length: 10 }),
    sessionType: varchar('session_type', { length: 50 }), // JWT_BEARER / COOKIE_SESSION
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at').defaultNow(),
    expiresAt: timestamp('expires_at'),
});

export const loginActivities = pgTable('login_activities', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    activity: varchar('activity', { length: 100 }).notNull(),
    deviceName: varchar('device_name', { length: 100 }),
    browser: varchar('browser', { length: 100 }),
    ipAddress: varchar('ip_address', { length: 100 }),
    country: varchar('country', { length: 10 }),
    success: boolean('success').notNull(),
    os: varchar('os', { length: 100 }),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at').defaultNow(),
});

// Relations untuk query .with
export const usersRelations = relations(users, ({ many }) => ({
    roles: many(userRoles),
    claims: many(userClaims),
    logins: many(userLogins),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
    user: one(users, { fields: [userRoles.userId], references: [users.id] }),
    role: one(roles, { fields: [userRoles.roleId], references: [roles.id] }),
}));

// Tambahkan ke src/db/schema.ts kamu
// Schema untuk ChartOfAccountsService

import { numeric, serial } from 'drizzle-orm/pg-core';

// === Chart of Accounts ===
export const chartOfAccounts = pgTable('chart_of_accounts', {
    id: serial('id').primaryKey(), // di C# int
    userId: uuid('user_id').notNull(),
    referenceNumber: integer('reference_number').notNull(),
    accountName: varchar('account_name', { length: 256 }).notNull(),
    type: varchar('type', { length: 100 }).notNull(), // Asset, Liability, etc
    role: varchar('role', { length: 100 }).default('Default'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// === Periods ===
export const periods = pgTable('periods', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    periodName: varchar('period_name', { length: 100 }).notNull(),
    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date').notNull(),
    isClosed: boolean('is_closed').default(false),
    createdAt: timestamp('created_at').defaultNow(),
});

// === Journal Entries ===
export const journalEntries = pgTable('journal_entries', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    journalType: varchar('journal_type', { length: 50 }).notNull(), // General, Adjusting
    entryDate: timestamp('entry_date').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow(),
});

// === Journal Entry Lines ===
export const journalEntryLines = pgTable('journal_entry_lines', {
    id: uuid('id').primaryKey().defaultRandom(),
    journalEntryId: uuid('journal_entry_id').references(() => journalEntries.id, { onDelete: 'cascade' }).notNull(),
    accountId: integer('account_id').references(() => chartOfAccounts.id, { onDelete: 'restrict' }).notNull(),
    debit: numeric('debit', { precision: 18, scale: 2 }).default('0').notNull(),
    credit: numeric('credit', { precision: 18, scale: 2 }).default('0').notNull(),
    description: text('description'),
});

// === User Settings (untuk SelectedPeriodHelper) ===
export const userSettings = pgTable('user_settings', {
    userId: uuid('user_id').primaryKey(),
    selectedPeriodId: uuid('selected_period_id').references(() => periods.id),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const chartOfAccountsRelations = relations(chartOfAccounts, ({ many }) => ({
    journalLines: many(journalEntryLines),
}));

export const journalEntriesRelations = relations(journalEntries, ({ many }) => ({
    lines: many(journalEntryLines),
}));

// Tambahan schema untuk JournalEntry
import { unique } from 'drizzle-orm/pg-core';

// === Transaction Counters - untuk nomor transaksi atomik ===
export const transactionCounters = pgTable('transaction_counters', {
    userId: uuid('user_id').notNull(),
    counterKey: varchar('counter_key', { length: 20 }).notNull(), // GJ2505, AJ2505
    lastSequence: integer('last_sequence').notNull().default(0),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => ({
    // Composite unique - sama dengan ON CONFLICT (UserId, CounterKey) di C#
    uniq: unique().on(t.userId, t.counterKey)
}));

// Jika belum ada dari file sebelumnya, ini definisi lengkap:
// journal_entries & journal_entry_lines & periods sudah ada di file coa sebelumnya
// Pastikan id di journal_entries adalah serial int (sesuai C# int) bukan uuid
// Di C# kamu: Id int untuk JournalEntry

// Versi yang konsisten dengan C# (id int):
export const journalEntries = pgTable('journal_entries', {
    id: serial('id').primaryKey(), // int di C#
    userId: uuid('user_id').notNull(),
    transactionNumber: varchar('transaction_number', { length: 20 }).notNull().unique(),
    journalType: varchar('journal_type', { length: 50 }).notNull().default('General'),
    entryDate: timestamp('entry_date').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at'),
});

export const journalEntryLines = pgTable('journal_entry_lines', {
    id: serial('id').primaryKey(),
    journalEntryId: integer('journal_entry_id').references(() => journalEntries.id, { onDelete: 'cascade' }).notNull(),
    accountId: integer('account_id').notNull(), // FK ke chart_of_accounts.id
    lineDescription: text('line_description'),
    debit: numeric('debit', { precision: 18, scale: 2 }).notNull().default('0'),
    credit: numeric('credit', { precision: 18, scale: 2 }).notNull().default('0'),
    lineOrder: integer('line_order').notNull().default(0),
});

export const periods = pgTable('periods', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    periodName: varchar('period_name', { length: 100 }).notNull(),
    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date').notNull(),
    isClosed: boolean('is_closed').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});
