import { pgSchema, pgTable, integer, serial, uuid, bigserial, text, varchar, bigint, date, jsonb, boolean, doublePrecision, timestamp, numeric, index, uniqueIndex, foreignKey, primaryKey, unique } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const hangfire = pgSchema("hangfire");


export const aggregatedcounterInHangfire = hangfire.table("aggregatedcounter", {
	id: bigserial({ mode: 'number' }).primaryKey(),
	key: text().notNull(),
	value: bigint({ mode: 'number' }).notNull(),
	expireat: timestamp({ withTimezone: true }),
}, (table) => [
	unique("aggregatedcounter_key_key").on(table.key),]);

export const counterInHangfire = hangfire.table("counter", {
	id: bigserial({ mode: 'number' }).primaryKey(),
	key: text().notNull(),
	value: bigint({ mode: 'number' }).notNull(),
	expireat: timestamp({ withTimezone: true }),
}, (table) => [
	index("ix_hangfire_counter_expireat").using("btree", table.expireat.asc().nullsLast()),
	index("ix_hangfire_counter_key").using("btree", table.key.asc().nullsLast()),
]);

export const hashInHangfire = hangfire.table("hash", {
	id: bigserial({ mode: 'number' }).primaryKey(),
	key: text().notNull(),
	field: text().notNull(),
	value: text(),
	expireat: timestamp({ withTimezone: true }),
	updatecount: integer().default(0).notNull(),
}, (table) => [
	index("ix_hangfire_hash_expireat").using("btree", table.expireat.asc().nullsLast()),
	unique("hash_key_field_key").on(table.key, table.field),]);

export const jobInHangfire = hangfire.table("job", {
	id: bigserial({ mode: 'number' }).primaryKey(),
	stateid: bigint({ mode: 'number' }),
	statename: text(),
	invocationdata: jsonb().notNull(),
	arguments: jsonb().notNull(),
	createdat: timestamp({ withTimezone: true }).notNull(),
	expireat: timestamp({ withTimezone: true }),
	updatecount: integer().default(0).notNull(),
}, (table) => [
	index("ix_hangfire_job_expireat").using("btree", table.expireat.asc().nullsLast()),
	index("ix_hangfire_job_statename").using("btree", table.statename.asc().nullsLast()),
	index("ix_hangfire_job_statename_is_not_null").using("btree", table.statename.asc().nullsLast()).where(sql`(statename IS NOT NULL)`),
]);

export const jobparameterInHangfire = hangfire.table("jobparameter", {
	id: bigserial({ mode: 'number' }).primaryKey(),
	jobid: bigint({ mode: 'number' }).notNull().references(() => jobInHangfire.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	name: text().notNull(),
	value: text(),
	updatecount: integer().default(0).notNull(),
}, (table) => [
	index("ix_hangfire_jobparameter_jobidandname").using("btree", table.jobid.asc().nullsLast(), table.name.asc().nullsLast()),
]);

export const jobqueueInHangfire = hangfire.table("jobqueue", {
	id: bigserial({ mode: 'number' }).primaryKey(),
	jobid: bigint({ mode: 'number' }).notNull(),
	queue: text().notNull(),
	fetchedat: timestamp({ withTimezone: true }),
	updatecount: integer().default(0).notNull(),
}, (table) => [
	index("ix_hangfire_jobqueue_fetchedat_queue_jobid").using("btree", table.fetchedat.asc().nullsFirst(), table.queue.asc().nullsLast(), table.jobid.asc().nullsLast()),
	index("ix_hangfire_jobqueue_jobidandqueue").using("btree", table.jobid.asc().nullsLast(), table.queue.asc().nullsLast()),
	index("ix_hangfire_jobqueue_queueandfetchedat").using("btree", table.queue.asc().nullsLast(), table.fetchedat.asc().nullsLast()),
]);

export const listInHangfire = hangfire.table("list", {
	id: bigserial({ mode: 'number' }).primaryKey(),
	key: text().notNull(),
	value: text(),
	expireat: timestamp({ withTimezone: true }),
	updatecount: integer().default(0).notNull(),
}, (table) => [
	index("ix_hangfire_list_expireat").using("btree", table.expireat.asc().nullsLast()),
]);

export const lockInHangfire = hangfire.table("lock", {
	resource: text().notNull(),
	updatecount: integer().default(0).notNull(),
	acquired: timestamp({ withTimezone: true }),
}, (table) => [
	unique("lock_resource_key").on(table.resource),]);

export const schemaInHangfire = hangfire.table("schema", {
	version: integer().primaryKey(),
});

export const serverInHangfire = hangfire.table("server", {
	id: text().primaryKey(),
	data: jsonb(),
	lastheartbeat: timestamp({ withTimezone: true }).notNull(),
	updatecount: integer().default(0).notNull(),
});

export const setInHangfire = hangfire.table("set", {
	id: bigserial({ mode: 'number' }).primaryKey(),
	key: text().notNull(),
	score: doublePrecision().notNull(),
	value: text().notNull(),
	expireat: timestamp({ withTimezone: true }),
	updatecount: integer().default(0).notNull(),
}, (table) => [
	index("ix_hangfire_set_expireat").using("btree", table.expireat.asc().nullsLast()),
	index("ix_hangfire_set_key_score").using("btree", table.key.asc().nullsLast(), table.score.asc().nullsLast()),
	unique("set_key_value_key").on(table.key, table.value),]);

export const stateInHangfire = hangfire.table("state", {
	id: bigserial({ mode: 'number' }).primaryKey(),
	jobid: bigint({ mode: 'number' }).notNull().references(() => jobInHangfire.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	name: text().notNull(),
	reason: text(),
	createdat: timestamp({ withTimezone: true }).notNull(),
	data: jsonb(),
	updatecount: integer().default(0).notNull(),
}, (table) => [
	index("ix_hangfire_state_jobid").using("btree", table.jobid.asc().nullsLast()),
]);

export const efMigrationsHistory = pgTable("__EFMigrationsHistory", {
	migrationId: varchar("MigrationId", { length: 150 }).notNull(),
	productVersion: varchar("ProductVersion", { length: 32 }).notNull(),
}, (table) => [
	primaryKey({ columns: [table.migrationId], name: "PK___EFMigrationsHistory"}),
]);

export const adjustingJournal = pgTable("AdjustingJournal", {
	id: serial("Id").primaryKey(),
	journalEntryId: integer("JournalEntryId"),
	transactionNumber: varchar("TransactionNumber"),
	entryDate: timestamp("EntryDate", { withTimezone: true }),
	journalType: varchar("JournalType"),
	headerDescription: text("HeaderDescription"),
	status: text("Status"),
	userId: uuid("UserId"),
	lineId: integer("LineId"),
	accountId: integer("AccountId"),
	lineDescription: varchar("LineDescription"),
	debit: numeric("Debit"),
	credit: numeric("Credit"),
	lineOrder: integer("LineOrder"),
	createdAt: timestamp("CreatedAt", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("UpdatedAt", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
});

export const aspNetRoleClaims = pgTable("AspNetRoleClaims", {
	id: integer("Id").generatedByDefaultAsIdentity(),
	roleId: uuid("RoleId").notNull().references(() => aspNetRoles.id, { onDelete: "cascade" } ),
	claimType: text("ClaimType"),
	claimValue: text("ClaimValue"),
}, (table) => [
	primaryKey({ columns: [table.id], name: "PK_AspNetRoleClaims"}),
	index("IX_AspNetRoleClaims_RoleId").using("btree", table.roleId.asc().nullsLast()),
]);

export const aspNetRoles = pgTable("AspNetRoles", {
	id: uuid("Id").notNull(),
	name: varchar("Name", { length: 256 }),
	normalizedName: varchar("NormalizedName", { length: 256 }),
	concurrencyStamp: text("ConcurrencyStamp"),
}, (table) => [
	primaryKey({ columns: [table.id], name: "PK_AspNetRoles"}),
	uniqueIndex("RoleNameIndex").using("btree", table.normalizedName.asc().nullsLast()),
]);

export const aspNetUserClaims = pgTable("AspNetUserClaims", {
	id: integer("Id").generatedByDefaultAsIdentity(),
	userId: uuid("UserId").notNull().references(() => aspNetUsers.id, { onDelete: "cascade" } ),
	claimType: text("ClaimType"),
	claimValue: text("ClaimValue"),
}, (table) => [
	primaryKey({ columns: [table.id], name: "PK_AspNetUserClaims"}),
	index("IX_AspNetUserClaims_UserId").using("btree", table.userId.asc().nullsLast()),
]);

export const aspNetUserLogins = pgTable("AspNetUserLogins", {
	loginProvider: text("LoginProvider").notNull(),
	providerKey: text("ProviderKey").notNull(),
	providerDisplayName: text("ProviderDisplayName"),
	userId: uuid("UserId").notNull().references(() => aspNetUsers.id, { onDelete: "cascade" } ),
}, (table) => [
	primaryKey({ columns: [table.loginProvider, table.providerKey], name: "PK_AspNetUserLogins"}),
	index("IX_AspNetUserLogins_UserId").using("btree", table.userId.asc().nullsLast()),
]);

export const aspNetUserRoles = pgTable("AspNetUserRoles", {
	userId: uuid("UserId").notNull().references(() => aspNetUsers.id, { onDelete: "cascade" } ),
	roleId: uuid("RoleId").notNull().references(() => aspNetRoles.id, { onDelete: "cascade" } ),
}, (table) => [
	primaryKey({ columns: [table.userId, table.roleId], name: "PK_AspNetUserRoles"}),
	index("IX_AspNetUserRoles_RoleId").using("btree", table.roleId.asc().nullsLast()),
]);

export const aspNetUsers = pgTable("AspNetUsers", {
	id: uuid("Id").notNull(),
	fullName: text("FullName"),
	userName: varchar("UserName", { length: 256 }),
	normalizedUserName: varchar("NormalizedUserName", { length: 256 }),
	email: varchar("Email", { length: 256 }),
	normalizedEmail: varchar("NormalizedEmail", { length: 256 }),
	emailConfirmed: boolean("EmailConfirmed").notNull(),
	passwordHash: text("PasswordHash"),
	securityStamp: text("SecurityStamp"),
	concurrencyStamp: text("ConcurrencyStamp"),
	phoneNumber: text("PhoneNumber"),
	phoneNumberConfirmed: boolean("PhoneNumberConfirmed").notNull(),
	twoFactorEnabled: boolean("TwoFactorEnabled").notNull(),
	lockoutEnd: timestamp("LockoutEnd", { withTimezone: true }),
	lockoutEnabled: boolean("LockoutEnabled").notNull(),
	accessFailedCount: integer("AccessFailedCount").notNull(),
	avatarUrl: text("AvatarUrl"),
	bio: text("Bio"),
}, (table) => [
	primaryKey({ columns: [table.id], name: "PK_AspNetUsers"}),
	index("EmailIndex").using("btree", table.normalizedEmail.asc().nullsLast()),
	uniqueIndex("UserNameIndex").using("btree", table.normalizedUserName.asc().nullsLast()),
]);

export const aspNetUserTokens = pgTable("AspNetUserTokens", {
	userId: uuid("UserId").notNull().references(() => aspNetUsers.id, { onDelete: "cascade" } ),
	loginProvider: text("LoginProvider").notNull(),
	name: text("Name").notNull(),
	value: text("Value"),
}, (table) => [
	primaryKey({ columns: [table.userId, table.loginProvider, table.name], name: "PK_AspNetUserTokens"}),
]);

export const chartOfAccounts = pgTable("ChartOfAccounts", {
	id: integer("Id").generatedByDefaultAsIdentity(),
	referenceNumber: integer("ReferenceNumber").notNull(),
	accountName: varchar("AccountName", { length: 100 }).notNull(),
	type: text("Type").notNull(),
	role: text("Role").notNull(),
	isActive: boolean("IsActive").notNull(),
	userId: uuid("UserId").notNull(),
}, (table) => [
	primaryKey({ columns: [table.id], name: "PK_ChartOfAccounts"}),
	index("IX_ChartOfAccounts_UserId").using("btree", table.userId.asc().nullsLast()),
	uniqueIndex("IX_ChartOfAccounts_UserId_ReferenceNumber").using("btree", table.userId.asc().nullsLast(), table.referenceNumber.asc().nullsLast()),
]);

export const closingJournal = pgTable("ClosingJournal", {
	id: serial("Id").primaryKey(),
	journalEntryId: integer("JournalEntryId"),
	transactionNumber: varchar("TransactionNumber"),
	entryDate: timestamp("EntryDate", { withTimezone: true }),
	journalType: varchar("JournalType"),
	headerDescription: text("HeaderDescription"),
	status: text("Status"),
	userId: uuid("UserId"),
	lineId: integer("LineId"),
	accountId: integer("AccountId"),
	lineDescription: varchar("LineDescription"),
	debit: numeric("Debit"),
	credit: numeric("Credit"),
	lineOrder: integer("LineOrder"),
	createdAt: timestamp("CreatedAt", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("UpdatedAt", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
});

export const dataProtectionKeys = pgTable("DataProtectionKeys", {
	id: integer("Id").generatedByDefaultAsIdentity(),
	friendlyName: text("FriendlyName"),
	xml: text("Xml"),
}, (table) => [
	primaryKey({ columns: [table.id], name: "PK_DataProtectionKeys"}),
]);

export const generalJournal = pgTable("GeneralJournal", {
	id: serial("Id").primaryKey(),
	journalEntryId: integer("JournalEntryId"),
	transactionNumber: varchar("TransactionNumber", { length: 255 }),
	entryDate: timestamp("EntryDate", { withTimezone: true }),
	journalType: varchar("JournalType", { length: 255 }),
	headerDescription: text("HeaderDescription"),
	status: text("Status"),
	userId: uuid("UserId"),
	lineId: integer("LineId"),
	accountId: integer("AccountId"),
	lineDescription: varchar("LineDescription", { length: 255 }),
	debit: numeric("Debit"),
	credit: numeric("Credit"),
	lineOrder: integer("LineOrder"),
	createdAt: timestamp("CreatedAt", { withTimezone: true }),
	updatedAt: timestamp("UpdatedAt", { withTimezone: true }),
});

export const generalLedgerPermanentAccounts = pgTable("GeneralLedgerPermanentAccounts", {
	id: serial("Id").notNull(),
	userId: uuid("UserId").notNull(),
	periodId: integer("PeriodId").notNull().references(() => periods.id, { onDelete: "cascade" } ),
	accountId: integer("AccountId").notNull().references(() => chartOfAccounts.id, { onDelete: "restrict" } ),
	journalEntryId: integer("JournalEntryId").notNull().references(() => journalEntries.id, { onDelete: "cascade" } ),
	journalEntryLineId: integer("JournalEntryLineId").notNull().references(() => journalEntryLines.id, { onDelete: "cascade" } ),
	entryDate: timestamp("EntryDate", { withTimezone: true }).notNull(),
	transactionNumber: varchar("TransactionNumber", { length: 255 }).notNull(),
	lineDescription: text("LineDescription"),
	debit: numeric("Debit", { mode: 'number', precision: 18, scale: 2 }).default(0.00).notNull(),
	credit: numeric("Credit", { mode: 'number', precision: 18, scale: 2 }).default(0.00).notNull(),
	runningBalance: numeric("RunningBalance", { mode: 'number', precision: 18, scale: 2 }).default(0.00).notNull(),
}, (table) => [
	primaryKey({ columns: [table.id], name: "permanent_account_general_ledgers_pkey"}),
	index("idx_pagl_user_period_account").using("btree", table.userId.asc().nullsLast(), table.periodId.asc().nullsLast(), table.accountId.asc().nullsLast()),
]);

export const generalLedgerTemporaryAccounts = pgTable("GeneralLedgerTemporaryAccounts", {
	id: serial("Id").notNull(),
	userId: uuid("UserId").notNull(),
	periodId: integer("PeriodId").notNull().references(() => periods.id, { onDelete: "cascade" } ),
	accountId: integer("AccountId").notNull().references(() => chartOfAccounts.id, { onDelete: "restrict" } ),
	journalEntryId: integer("JournalEntryId").notNull().references(() => journalEntries.id, { onDelete: "cascade" } ),
	journalEntryLineId: integer("JournalEntryLineId").notNull().references(() => journalEntryLines.id, { onDelete: "cascade" } ),
	entryDate: timestamp("EntryDate", { withTimezone: true }).notNull(),
	transactionNumber: varchar("TransactionNumber", { length: 255 }).notNull(),
	lineDescription: text("LineDescription"),
	debit: numeric("Debit", { mode: 'number', precision: 18, scale: 2 }).default(0.00).notNull(),
	credit: numeric("Credit", { mode: 'number', precision: 18, scale: 2 }).default(0.00).notNull(),
	runningBalance: numeric("RunningBalance", { mode: 'number', precision: 18, scale: 2 }).default(0.00).notNull(),
}, (table) => [
	primaryKey({ columns: [table.id], name: "temporary_account_general_ledgers_pkey"}),
	index("idx_tagl_user_period_account").using("btree", table.userId.asc().nullsLast(), table.periodId.asc().nullsLast(), table.accountId.asc().nullsLast()),
]);

export const journalEntries = pgTable("JournalEntries", {
	id: integer("Id").generatedByDefaultAsIdentity(),
	journalType: varchar("JournalType", { length: 50 }).notNull(),
	entryDate: timestamp("EntryDate", { withTimezone: true }).notNull(),
	createdAt: timestamp("CreatedAt", { withTimezone: true }).default(sql`now()`).notNull(),
	transactionNumber: varchar("TransactionNumber", { length: 30 }).notNull(),
	userId: uuid("UserId").notNull().references(() => aspNetUsers.id, { onDelete: "cascade" } ),
	updatedAt: timestamp("UpdatedAt", { withTimezone: true }),
	description: text("Description"),
	status: text("Status").default(sql`0`),
}, (table) => [
	primaryKey({ columns: [table.id], name: "PK_JournalEntries"}),
	index("IX_JournalEntries_UserId").using("btree", table.userId.asc().nullsLast()),
	uniqueIndex("IX_JournalEntries_UserId_TransactionNumber").using("btree", table.userId.asc().nullsLast(), table.transactionNumber.asc().nullsLast()),
]);

export const journalEntryLines = pgTable("JournalEntryLines", {
	id: integer("Id").generatedByDefaultAsIdentity(),
	journalEntryId: integer("JournalEntryId").notNull().references(() => journalEntries.id, { onDelete: "cascade" } ),
	accountId: integer("AccountId").notNull().references(() => chartOfAccounts.id, { onDelete: "restrict" } ),
	lineDescription: varchar("LineDescription", { length: 250 }),
	debit: numeric("Debit", { precision: 18, scale: 2 }).notNull(),
	credit: numeric("Credit", { precision: 18, scale: 2 }).notNull(),
	lineOrder: integer("LineOrder").notNull(),
}, (table) => [
	primaryKey({ columns: [table.id], name: "PK_JournalEntryLines"}),
	index("IX_JournalEntryLines_AccountId").using("btree", table.accountId.asc().nullsLast()),
	index("IX_JournalEntryLines_JournalEntryId").using("btree", table.journalEntryId.asc().nullsLast()),
]);

export const loginActivities = pgTable("LoginActivities", {
	id: uuid("Id").notNull(),
	userId: uuid("UserId").notNull().references(() => aspNetUsers.id, { onDelete: "cascade" } ),
	activityType: text("ActivityType").notNull(),
	isSuccess: boolean("IsSuccess").notNull(),
	device: text("Device").notNull(),
	browser: text("Browser").notNull(),
	operatingSystem: text("OperatingSystem").notNull(),
	ipAddress: text("IpAddress").notNull(),
	country: text("Country").notNull(),
	userAgent: text("UserAgent").notNull(),
	createdAt: timestamp("CreatedAt", { withTimezone: true }).notNull(),
}, (table) => [
	primaryKey({ columns: [table.id], name: "PK_LoginActivities"}),
	index("IX_LoginActivities_UserId_CreatedAt").using("btree", table.userId.asc().nullsLast(), table.createdAt.asc().nullsLast()),
]);

export const notifications = pgTable("Notifications", {
	id: uuid("Id").notNull(),
	userId: uuid("UserId").notNull().references(() => aspNetUsers.id, { onDelete: "cascade" } ),
	title: text("Title").notNull(),
	message: text("Message").notNull(),
	type: text("Type").notNull(),
	isRead: boolean("IsRead").notNull(),
	targetUrl: text("TargetUrl"),
	createdAt: timestamp("CreatedAt", { withTimezone: true }).notNull(),
}, (table) => [
	primaryKey({ columns: [table.id], name: "PK_Notifications"}),
	index("IX_Notifications_UserId_IsRead_CreatedAt").using("btree", table.userId.asc().nullsLast(), table.isRead.asc().nullsLast(), table.createdAt.asc().nullsLast()),
]);

export const periods = pgTable("Periods", {
	id: integer("Id").generatedByDefaultAsIdentity(),
	periodName: varchar("PeriodName", { length: 50 }).notNull(),
	startDate: timestamp("StartDate", { withTimezone: true }).notNull(),
	endDate: timestamp("EndDate", { withTimezone: true }).notNull(),
	isClosed: boolean("IsClosed").default(false).notNull(),
	isSelected: boolean("IsSelected").default(false).notNull(),
	userId: uuid("UserId").notNull(),
}, (table) => [
	primaryKey({ columns: [table.id], name: "PK_Periods"}),
	uniqueIndex("IX_Periods_IsSelected_Unique").using("btree", table.userId.asc().nullsLast()).where(sql`("IsSelected" = true)`),
	index("IX_Periods_UserId").using("btree", table.userId.asc().nullsLast()),
]);

export const recoveryCodes = pgTable("RecoveryCodes", {
	id: uuid("Id").primaryKey(),
	userId: uuid("UserId").notNull().references(() => aspNetUsers.id, { onDelete: "cascade" } ),
	codeHash: varchar("CodeHash", { length: 255 }).notNull(),
	used: boolean("Used").default(false).notNull(),
	createdAt: timestamp("CreatedAt", { withTimezone: true }).notNull(),
	usedAt: timestamp("UsedAt", { withTimezone: true }),
}, (table) => [
	index("IX_RecoveryCodes_UserId").using("btree", table.userId.asc().nullsLast()),
]);

export const securitySettings = pgTable("SecuritySettings", {
	userId: uuid("UserId").primaryKey().references(() => aspNetUsers.id, { onDelete: "cascade" } ),
	emailVerified: boolean("EmailVerified").default(false).notNull(),
	twoFactorEnabled: boolean("TwoFactorEnabled").default(false).notNull(),
	loginNotificationEnabled: boolean("LoginNotificationEnabled").default(true).notNull(),
	sessionTimeoutMinutes: integer("SessionTimeoutMinutes").default(30).notNull(),
	updatedAt: timestamp("UpdatedAt", { withTimezone: true }).notNull(),
});

export const transactionCounters = pgTable("TransactionCounters", {
	id: integer("Id").primaryKey().generatedByDefaultAsIdentity(),
	userId: uuid("UserId").notNull(),
	counterKey: varchar("CounterKey", { length: 10 }).notNull(),
	lastSequence: integer("LastSequence").notNull(),
}, (table) => [
	uniqueIndex("IX_TransactionCounters_UserId_CounterKey").using("btree", table.userId.asc().nullsLast(), table.counterKey.asc().nullsLast()),
]);

export const trialBalance = pgTable("TrialBalance", {
	id: serial("Id").notNull(),
	userId: uuid("UserId").notNull(),
	periodId: integer("PeriodId").notNull(),
	accountId: integer("AccountId").notNull(),
	endingDebit: numeric("EndingDebit", { mode: 'number', precision: 18, scale: 2 }).default(0).notNull(),
	endingCredit: numeric("EndingCredit", { mode: 'number', precision: 18, scale: 2 }).default(0).notNull(),
	createdAt: timestamp("CreatedAt", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("UpdatedAt", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	primaryKey({ columns: [table.id], name: "TrialBalanceUnadjusted_pkey"}),
	unique("UQ_TB_Unadjusted_User_Period_Account").on(table.userId, table.periodId, table.accountId),]);

export const trialBalanceAdjusted = pgTable("TrialBalanceAdjusted", {
	id: serial("Id").primaryKey(),
	userId: uuid("UserId").notNull(),
	periodId: integer("PeriodId").notNull(),
	accountId: integer("AccountId").notNull(),
	endingDebit: numeric("EndingDebit", { mode: 'number', precision: 18, scale: 2 }).default(0).notNull(),
	endingCredit: numeric("EndingCredit", { mode: 'number', precision: 18, scale: 2 }).default(0).notNull(),
	createdAt: timestamp("CreatedAt", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("UpdatedAt", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("UQ_TB_Adjusted_User_Period_Account").on(table.userId, table.periodId, table.accountId),]);

export const trialBalancePostClosing = pgTable("TrialBalancePostClosing", {
	id: serial("Id").primaryKey(),
	userId: uuid("UserId").notNull(),
	periodId: integer("PeriodId").notNull(),
	accountId: integer("AccountId").notNull(),
	endingDebit: numeric("EndingDebit", { mode: 'number', precision: 18, scale: 2 }).default(0).notNull(),
	endingCredit: numeric("EndingCredit", { mode: 'number', precision: 18, scale: 2 }).default(0).notNull(),
	createdAt: timestamp("CreatedAt", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("UpdatedAt", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("UQ_TB_PostClosing_User_Period_Account").on(table.userId, table.periodId, table.accountId),]);

export const trustedDevices = pgTable("TrustedDevices", {
	id: uuid("Id").primaryKey(),
	userId: uuid("UserId").notNull().references(() => aspNetUsers.id, { onDelete: "cascade" } ),
	deviceName: varchar("DeviceName", { length: 100 }).notNull(),
	deviceIdentifier: varchar("DeviceIdentifier", { length: 255 }).notNull(),
	browser: varchar("Browser", { length: 100 }).notNull(),
	operatingSystem: varchar("OperatingSystem", { length: 100 }).notNull(),
	isTrusted: boolean("IsTrusted").default(true).notNull(),
	createdAt: timestamp("CreatedAt", { withTimezone: true }).notNull(),
	lastUsedAt: timestamp("LastUsedAt", { withTimezone: true }).notNull(),
}, (table) => [
	index("IX_TrustedDevices_UserId").using("btree", table.userId.asc().nullsLast()),
	unique("TrustedDevices_DeviceIdentifier_key").on(table.deviceIdentifier),]);

export const userSessions = pgTable("UserSessions", {
	id: uuid("Id").notNull(),
	userId: uuid("UserId").notNull().references(() => aspNetUsers.id, { onDelete: "cascade" } ),
	deviceName: text("DeviceName").notNull(),
	browser: text("Browser").notNull(),
	operatingSystem: text("OperatingSystem").notNull(),
	ipAddress: text("IpAddress").notNull(),
	country: text("Country").notNull(),
	userAgent: text("UserAgent").notNull(),
	refreshTokenHash: text("RefreshTokenHash").notNull(),
	isActive: boolean("IsActive").notNull(),
	isCurrent: boolean("IsCurrent").notNull(),
	createdAt: timestamp("CreatedAt", { withTimezone: true }).notNull(),
	lastActivityAt: timestamp("LastActivityAt", { withTimezone: true }).notNull(),
	revokedAt: timestamp("RevokedAt", { withTimezone: true }),
}, (table) => [
	primaryKey({ columns: [table.id], name: "PK_UserSessions"}),
	index("IX_UserSessions_UserId_IsActive").using("btree", table.userId.asc().nullsLast(), table.isActive.asc().nullsLast()),
]);

export const worksheet = pgTable("Worksheet", {
	id: serial("Id").primaryKey(),
	periodDate: date("PeriodDate"),
	accountNumber: varchar("AccountNumber", { length: 50 }).notNull(),
	accountName: varchar("AccountName", { length: 255 }).notNull(),
	trialBalanceDebit: numeric("TrialBalanceDebit", { mode: 'number', precision: 18, scale: 2 }).default(0),
	trialBalanceCredit: numeric("TrialBalanceCredit", { mode: 'number', precision: 18, scale: 2 }).default(0),
	adjustingJournalDebit: numeric("AdjustingJournalDebit", { mode: 'number', precision: 18, scale: 2 }).default(0),
	adjustingJournalCredit: numeric("AdjustingJournalCredit", { mode: 'number', precision: 18, scale: 2 }).default(0),
	trialBalanceAdjustedDebit: numeric("TrialBalanceAdjustedDebit", { mode: 'number', precision: 18, scale: 2 }).default(0),
	trialBalanceAdjustedCredit: numeric("TrialBalanceAdjustedCredit", { mode: 'number', precision: 18, scale: 2 }).default(0),
	incomeStatementDebit: numeric("IncomeStatementDebit", { mode: 'number', precision: 18, scale: 2 }).default(0),
	incomeStatementCredit: numeric("IncomeStatementCredit", { mode: 'number', precision: 18, scale: 2 }).default(0),
	financialPositionDebit: numeric("FinancialPositionDebit", { mode: 'number', precision: 18, scale: 2 }).default(0),
	financialPositionCredit: numeric("FinancialPositionCredit", { mode: 'number', precision: 18, scale: 2 }).default(0),
	createdAt: timestamp("CreatedAt", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("UpdatedAt", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
});
