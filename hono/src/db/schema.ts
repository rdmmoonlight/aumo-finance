import { pgTable, varchar, uniqueIndex, uuid, text, index, foreignKey, integer, boolean, timestamp, serial, bigint, numeric, unique, pgSchema, bigserial, jsonb, doublePrecision, primaryKey } from "drizzle-orm/pg-core" 
import { sql } from "drizzle-orm" 
  
export const hangfire = pgSchema("hangfire"); 
  
export const efMigrationsHistory = pgTable("__EFMigrationsHistory", { 
	migrationId: varchar("MigrationId", { length: 150 }).primaryKey().notNull(), 
	productVersion: varchar("ProductVersion", { length: 32 }).notNull(), 
}); 
  
export const aspNetRoles = pgTable("AspNetRoles", { 
	id: uuid("Id").primaryKey().notNull(), 
	name: varchar("Name", { length: 256 }), 
	normalizedName: varchar("NormalizedName", { length: 256 }), 
	concurrencyStamp: text("ConcurrencyStamp"), 
}, (table) => [ 
	uniqueIndex("RoleNameIndex").using("btree", table.normalizedName.asc().nullsLast().op("text_ops")), 
]); 
  
export const aspNetRoleClaims = pgTable("AspNetRoleClaims", { 
	id: integer("Id").primaryKey().generatedByDefaultAsIdentity({ name: "AspNetRoleClaims_Id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647 }), 
	roleId: uuid("RoleId").notNull(), 
	claimType: text("ClaimType"), 
	claimValue: text("ClaimValue"), 
}, (table) => [ 
	index("IX_AspNetRoleClaims_RoleId").using("btree", table.roleId.asc().nullsLast().op("uuid_ops")), 
	foreignKey({ 
			columns: [table.roleId], 
			foreignColumns: [aspNetRoles.id], 
			name: "FK_AspNetRoleClaims_AspNetRoles_RoleId" 
		}).onDelete("cascade"), 
]); 
  
export const aspNetUserClaims = pgTable("AspNetUserClaims", { 
	id: integer("Id").primaryKey().generatedByDefaultAsIdentity({ name: "AspNetUserClaims_Id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647 }), 
	userId: uuid("UserId").notNull(), 
	claimType: text("ClaimType"), 
	claimValue: text("ClaimValue"), 
}, (table) => [ 
	index("IX_AspNetUserClaims_UserId").using("btree", table.userId.asc().nullsLast().op("uuid_ops")), 
	foreignKey({ 
			columns: [table.userId], 
			foreignColumns: [aspNetUsers.id], 
			name: "FK_AspNetUserClaims_AspNetUsers_UserId" 
		}).onDelete("cascade"), 
]); 
  
export const aspNetUsers = pgTable("AspNetUsers", { 
	id: uuid("Id").primaryKey().notNull(), 
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
	lockoutEnd: timestamp("LockoutEnd", { withTimezone: true, mode: 'string' }), 
	lockoutEnabled: boolean("LockoutEnabled").notNull(), 
	accessFailedCount: integer("AccessFailedCount").notNull(), 
	avatarUrl: text("AvatarUrl"), 
	bio: text("Bio"), 
}, (table) => [ 
	index("EmailIndex").using("btree", table.normalizedEmail.asc().nullsLast().op("text_ops")), 
	uniqueIndex("UserNameIndex").using("btree", table.normalizedUserName.asc().nullsLast().op("text_ops")), 
]); 
  
export const chartOfAccounts = pgTable("ChartOfAccounts", { 
	id: integer("Id").primaryKey().generatedByDefaultAsIdentity({ name: "ChartOfAccounts_Id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647 }), 
	referenceNumber: integer("ReferenceNumber").notNull(), 
	accountName: varchar("AccountName", { length: 100 }).notNull(), 
	type: text("Type").notNull(), 
	role: text("Role").notNull(), 
	isActive: boolean("IsActive").notNull(), 
	userId: uuid("UserId").notNull(), 
}, (table) => [ 
	index("IX_ChartOfAccounts_UserId").using("btree", table.userId.asc().nullsLast().op("uuid_ops")), 
	uniqueIndex("IX_ChartOfAccounts_UserId_ReferenceNumber").using("btree", table.userId.asc().nullsLast().op("int4_ops"), table.referenceNumber.asc().nullsLast().op("int4_ops")), 
]); 
  
export const journalEntries = pgTable("JournalEntries", { 
	id: integer("Id").primaryKey().generatedByDefaultAsIdentity({ name: "JournalEntries_Id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647 }), 
	journalType: varchar("JournalType", { length: 50 }).notNull(), 
	entryDate: timestamp("EntryDate", { withTimezone: true, mode: 'string' }).notNull(), 
	createdAt: timestamp("CreatedAt", { withTimezone: true, mode: 'string' }).defaultNow().notNull(), 
	transactionNumber: varchar("TransactionNumber", { length: 30 }).notNull(), 
	userId: uuid("UserId").notNull(), 
	updatedAt: timestamp("UpdatedAt", { withTimezone: true, mode: 'string' }), 
}, (table) => [ 
	index("IX_JournalEntries_UserId").using("btree", table.userId.asc().nullsLast().op("uuid_ops")), 
	uniqueIndex("IX_JournalEntries_UserId_TransactionNumber").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.transactionNumber.asc().nullsLast().op("text_ops")), 
	foreignKey({ 
			columns: [table.userId], 
			foreignColumns: [aspNetUsers.id], 
			name: "FK_JournalEntries_AspNetUsers_UserId" 
		}).onDelete("cascade"), 
]); 
  
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
	foreignKey({ 
			columns: [table.userId], 
			foreignColumns: [aspNetUsers.id], 
			name: "FK_Notifications_AspNetUsers_UserId" 
		}).onDelete("cascade"), 
]); 
  
export const economicDocuments = pgTable("EconomicDocuments", { 
	id: serial("Id").primaryKey().notNull(), 
	title: varchar("Title", { length: 200 }).notNull(), 
	category: varchar("Category", { length: 50 }).notNull(), 
	referenceNumber: varchar("ReferenceNumber", { length: 100 }), 
	fileName: varchar("FileName", { length: 255 }).notNull(), 
	filePath: varchar("FilePath", { length: 500 }).notNull(), 
	fileSize: bigint("FileSize", { mode: "number" }).notNull(), 
	contentType: varchar("ContentType", { length: 100 }), 
	uploadedBy: text("UploadedBy").notNull(), 
	uploadDate: timestamp("UploadDate", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(), 
	description: text("Description"), 
	journalEntryId: bigint("JournalEntryId", { mode: "number" }), 
	userId: uuid("UserId").notNull(), 
	cloudPublicId: varchar("CloudPublicId", { length: 150 }), 
	folderId: uuid("FolderId"), 
}, (table) => [ 
	index("IX_EconomicDocuments_Category").using("btree", table.category.asc().nullsLast().op("text_ops")), 
	index("IX_EconomicDocuments_FolderId").using("btree", table.folderId.asc().nullsLast().op("uuid_ops")), 
	index("IX_EconomicDocuments_JournalEntryId").using("btree", table.journalEntryId.asc().nullsLast().op("int8_ops")), 
	index("IX_EconomicDocuments_ReferenceNumber").using("btree", table.referenceNumber.asc().nullsLast().op("text_ops")), 
	index("IX_EconomicDocuments_UserId").using("btree", table.userId.asc().nullsLast().op("uuid_ops")), 
	foreignKey({ 
			columns: [table.journalEntryId], 
			foreignColumns: [journalEntries.id], 
			name: "FK_EconomicDocuments_JournalEntries_JournalEntryId" 
		}).onDelete("set null"), 
	foreignKey({ 
			columns: [table.folderId], 
			foreignColumns: [folders.id], 
			name: "EconomicDocuments_FolderId_fkey" 
		}).onDelete("set null"), 
]); 
  
export const journalEntryLines = pgTable("JournalEntryLines", { 
	id: integer("Id").primaryKey().generatedByDefaultAsIdentity({ name: "JournalEntryLines_Id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647 }), 
	journalEntryId: integer("JournalEntryId").notNull(), 
	accountId: integer("AccountId").notNull(), 
	lineDescription: varchar("LineDescription", { length: 250 }), 
	debit: numeric("Debit", { precision: 18, scale: 2 }).notNull(), 
	credit: numeric("Credit", { precision: 18, scale: 2 }).notNull(), 
	lineOrder: integer("LineOrder").notNull(), 
}, (table) => [ 
	index("IX_JournalEntryLines_AccountId").using("btree", table.accountId.asc().nullsLast().op("int4_ops")), 
	index("IX_JournalEntryLines_JournalEntryId").using("btree", table.journalEntryId.asc().nullsLast().op("int4_ops")), 
	foreignKey({ 
			columns: [table.accountId], 
			foreignColumns: [chartOfAccounts.id], 
			name: "FK_JournalEntryLines_ChartOfAccounts_AccountId" 
		}).onDelete("restrict"), 
	foreignKey({ 
			columns: [table.journalEntryId], 
			foreignColumns: [journalEntries.id], 
			name: "FK_JournalEntryLines_JournalEntries_JournalEntryId" 
		}).onDelete("cascade"), 
]); 
  
export const dataProtectionKeys = pgTable("DataProtectionKeys", { 
	id: integer("Id").primaryKey().generatedByDefaultAsIdentity({ name: "DataProtectionKeys_Id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647 }), 
	friendlyName: text("FriendlyName"), 
	xml: text("Xml"), 
}); 
  
export const recoveryCodes = pgTable("RecoveryCodes", { 
	id: uuid("Id").primaryKey().notNull(), 
	userId: uuid("UserId").notNull(), 
	codeHash: varchar("CodeHash", { length: 255 }).notNull(), 
	used: boolean("Used").default(false).notNull(), 
	createdAt: timestamp("CreatedAt", { withTimezone: true, mode: 'string' }).notNull(), 
	usedAt: timestamp("UsedAt", { withTimezone: true, mode: 'string' }), 
}, (table) => [ 
	index("IX_RecoveryCodes_UserId").using("btree", table.userId.asc().nullsLast().op("uuid_ops")), 
	foreignKey({ 
			columns: [table.userId], 
			foreignColumns: [aspNetUsers.id], 
			name: "FK_RecoveryCodes_AspNetUsers" 
		}).onDelete("cascade"), 
]); 
  
export const securitySettings = pgTable("SecuritySettings", { 
	userId: uuid("UserId").primaryKey().notNull(), 
	emailVerified: boolean("EmailVerified").default(false).notNull(), 
	twoFactorEnabled: boolean("TwoFactorEnabled").default(false).notNull(), 
	loginNotificationEnabled: boolean("LoginNotificationEnabled").default(true).notNull(), 
	sessionTimeoutMinutes: integer("SessionTimeoutMinutes").default(30).notNull(), 
	updatedAt: timestamp("UpdatedAt", { withTimezone: true, mode: 'string' }).notNull(), 
}, (table) => [ 
	foreignKey({ 
			columns: [table.userId], 
			foreignColumns: [aspNetUsers.id], 
			name: "FK_SecuritySettings_AspNetUsers" 
		}).onDelete("cascade"), 
]); 
  
export const userSessions = pgTable("UserSessions", { 
	id: uuid("Id").primaryKey().notNull(), 
	userId: uuid("UserId").notNull(), 
	deviceName: text("DeviceName").notNull(), 
	browser: text("Browser").notNull(), 
	operatingSystem: text("OperatingSystem").notNull(), 
	ipAddress: text("IpAddress").notNull(), 
	country: text("Country").notNull(), 
	userAgent: text("UserAgent").notNull(), 
	refreshTokenHash: text("RefreshTokenHash").notNull(), 
	isActive: boolean("IsActive").notNull(), 
	isCurrent: boolean("IsCurrent").notNull(), 
	createdAt: timestamp("CreatedAt", { withTimezone: true, mode: 'string' }).notNull(), 
	lastActivityAt: timestamp("LastActivityAt", { withTimezone: true, mode: 'string' }).notNull(), 
	revokedAt: timestamp("RevokedAt", { withTimezone: true, mode: 'string' }), 
}, (table) => [ 
	index("IX_UserSessions_UserId_IsActive").using("btree", table.userId.asc().nullsLast().op("bool_ops"), table.isActive.asc().nullsLast().op("bool_ops")), 
	foreignKey({ 
			columns: [table.userId], 
			foreignColumns: [aspNetUsers.id], 
			name: "FK_UserSessions_AspNetUsers_UserId" 
		}).onDelete("cascade"), 
]); 
  
export const loginActivities = pgTable("LoginActivities", { 
	id: uuid("Id").primaryKey().notNull(), 
	userId: uuid("UserId").notNull(), 
	activityType: text("ActivityType").notNull(), 
	isSuccess: boolean("IsSuccess").notNull(), 
	device: text("Device").notNull(), 
	browser: text("Browser").notNull(), 
	operatingSystem: text("OperatingSystem").notNull(), 
	ipAddress: text("IpAddress").notNull(), 
	country: text("Country").notNull(), 
	userAgent: text("UserAgent").notNull(), 
	createdAt: timestamp("CreatedAt", { withTimezone: true, mode: 'string' }).notNull(), 
}, (table) => [ 
	index("IX_LoginActivities_UserId_CreatedAt").using("btree", table.userId.asc().nullsLast().op("timestamptz_ops"), table.createdAt.asc().nullsLast().op("timestamptz_ops")), 
	foreignKey({ 
			columns: [table.userId], 
			foreignColumns: [aspNetUsers.id], 
			name: "FK_LoginActivities_AspNetUsers_UserId" 
		}).onDelete("cascade"), 
]); 
  
export const trustedDevices = pgTable("TrustedDevices", { 
	id: uuid("Id").primaryKey().notNull(), 
	userId: uuid("UserId").notNull(), 
	deviceName: varchar("DeviceName", { length: 100 }).notNull(), 
	deviceIdentifier: varchar("DeviceIdentifier", { length: 255 }).notNull(), 
	browser: varchar("Browser", { length: 100 }).notNull(), 
	operatingSystem: varchar("OperatingSystem", { length: 100 }).notNull(), 
	isTrusted: boolean("IsTrusted").default(true).notNull(), 
	createdAt: timestamp("CreatedAt", { withTimezone: true, mode: 'string' }).notNull(), 
	lastUsedAt: timestamp("LastUsedAt", { withTimezone: true, mode: 'string' }).notNull(), 
}, (table) => [ 
	index("IX_TrustedDevices_UserId").using("btree", table.userId.asc().nullsLast().op("uuid_ops")), 
	foreignKey({ 
			columns: [table.userId], 
			foreignColumns: [aspNetUsers.id], 
			name: "FK_TrustedDevices_AspNetUsers" 
		}).onDelete("cascade"), 
	unique("TrustedDevices_DeviceIdentifier_key").on(table.deviceIdentifier), 
]); 
  
export const periods = pgTable("Periods", { 
	id: integer("Id").primaryKey().generatedByDefaultAsIdentity({ name: "Periods_Id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647 }), 
	periodName: varchar("PeriodName", { length: 50 }).notNull(), 
	startDate: timestamp("StartDate", { withTimezone: true, mode: 'string' }).notNull(), 
	endDate: timestamp("EndDate", { withTimezone: true, mode: 'string' }).notNull(), 
	isClosed: boolean("IsClosed").default(false).notNull(), 
	isSelected: boolean("IsSelected").default(false).notNull(), 
	userId: uuid("UserId").notNull(), 
}, (table) => [ 
	uniqueIndex("IX_Periods_IsSelected_Unique").using("btree", table.userId.asc().nullsLast().op("uuid_ops")).where(sql`("IsSelected" = true)`), 
	index("IX_Periods_UserId").using("btree", table.userId.asc().nullsLast().op("uuid_ops")), 
]); 
  
export const folders = pgTable("Folders", { 
	id: uuid("Id").primaryKey().notNull(), 
	name: varchar("Name", { length: 150 }).notNull(), 
	parentFolderId: uuid("ParentFolderId"), 
	userId: uuid("UserId").notNull(), 
	createdAt: timestamp("CreatedAt", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(), 
}, (table) => [ 
	index("IX_Folders_ParentFolderId").using("btree", table.parentFolderId.asc().nullsLast().op("uuid_ops")), 
	index("IX_Folders_UserId").using("btree", table.userId.asc().nullsLast().op("uuid_ops")), 
	foreignKey({ 
			columns: [table.parentFolderId], 
			foreignColumns: [table.id], 
			name: "Folders_ParentFolderId_fkey" 
		}).onDelete("cascade"), 
]); 
  
export const transactionCounters = pgTable("TransactionCounters", { 
	id: integer("Id").primaryKey().generatedByDefaultAsIdentity({ name: "TransactionCounters_Id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647 }), 
	userId: uuid("UserId").notNull(), 
	counterKey: varchar("CounterKey", { length: 10 }).notNull(), 
	lastSequence: integer("LastSequence").notNull(), 
}, (table) => [ 
	uniqueIndex("IX_TransactionCounters_UserId_CounterKey").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.counterKey.asc().nullsLast().op("text_ops")), 
]); 
  
export const schemaInHangfire = hangfire.table("schema", { 
	version: integer().primaryKey().notNull(), 
}); 
  
export const counterInHangfire = hangfire.table("counter", { 
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(), 
	key: text().notNull(), 
	value: bigint({ mode: "number" }).notNull(), 
	expireat: timestamp({ withTimezone: true, mode: 'string' }), 
}, (table) => [ 
	index("ix_hangfire_counter_expireat").using("btree", table.expireat.asc().nullsLast().op("timestamptz_ops")), 
	index("ix_hangfire_counter_key").using("btree", table.key.asc().nullsLast().op("text_ops")), 
]); 
  
export const hashInHangfire = hangfire.table("hash", { 
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(), 
	key: text().notNull(), 
	field: text().notNull(), 
	value: text(), 
	expireat: timestamp({ withTimezone: true, mode: 'string' }), 
	updatecount: integer().default(0).notNull(), 
}, (table) => [ 
	index("ix_hangfire_hash_expireat").using("btree", table.expireat.asc().nullsLast().op("timestamptz_ops")), 
	unique("hash_key_field_key").on(table.key, table.field), 
]); 
  
export const jobInHangfire = hangfire.table("job", { 
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(), 
	stateid: bigint({ mode: "number" }), 
	statename: text(), 
	invocationdata: jsonb().notNull(), 
	arguments: jsonb().notNull(), 
	createdat: timestamp({ withTimezone: true, mode: 'string' }).notNull(), 
	expireat: timestamp({ withTimezone: true, mode: 'string' }), 
	updatecount: integer().default(0).notNull(), 
}, (table) => [ 
	index("ix_hangfire_job_expireat").using("btree", table.expireat.asc().nullsLast().op("timestamptz_ops")), 
	index("ix_hangfire_job_statename").using("btree", table.statename.asc().nullsLast().op("text_ops")), 
	index("ix_hangfire_job_statename_is_not_null").using("btree", table.statename.asc().nullsLast().op("text_ops"), table.id.asc().nullsLast().op("text_ops")).where(sql`(statename IS NOT NULL)`), 
]); 
  
export const serverInHangfire = hangfire.table("server", { 
	id: text().primaryKey().notNull(), 
	data: jsonb(), 
	lastheartbeat: timestamp({ withTimezone: true, mode: 'string' }).notNull(), 
	updatecount: integer().default(0).notNull(), 
}); 
  
export const lockInHangfire = hangfire.table("lock", { 
	resource: text().notNull(), 
	updatecount: integer().default(0).notNull(), 
	acquired: timestamp({ withTimezone: true, mode: 'string' }), 
}, (table) => [ 
	unique("lock_resource_key").on(table.resource), 
]); 
  
export const stateInHangfire = hangfire.table("state", { 
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(), 
	jobid: bigint({ mode: "number" }).notNull(), 
	name: text().notNull(), 
	reason: text(), 
	createdat: timestamp({ withTimezone: true, mode: 'string' }).notNull(), 
	data: jsonb(), 
	updatecount: integer().default(0).notNull(), 
}, (table) => [ 
	index("ix_hangfire_state_jobid").using("btree", table.jobid.asc().nullsLast().op("int8_ops")), 
	foreignKey({ 
			columns: [table.jobid], 
			foreignColumns: [jobInHangfire.id], 
			name: "state_jobid_fkey" 
		}).onUpdate("cascade").onDelete("cascade"), 
]); 
  
export const jobqueueInHangfire = hangfire.table("jobqueue", { 
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(), 
	jobid: bigint({ mode: "number" }).notNull(), 
	queue: text().notNull(), 
	fetchedat: timestamp({ withTimezone: true, mode: 'string' }), 
	updatecount: integer().default(0).notNull(), 
}, (table) => [ 
	index("ix_hangfire_jobqueue_fetchedat_queue_jobid").using("btree", table.fetchedat.asc().nullsFirst().op("timestamptz_ops"), table.queue.asc().nullsLast().op("text_ops"), table.jobid.asc().nullsLast().op("text_ops")), 
	index("ix_hangfire_jobqueue_jobidandqueue").using("btree", table.jobid.asc().nullsLast().op("text_ops"), table.queue.asc().nullsLast().op("int8_ops")), 
	index("ix_hangfire_jobqueue_queueandfetchedat").using("btree", table.queue.asc().nullsLast().op("text_ops"), table.fetchedat.asc().nullsLast().op("timestamptz_ops")), 
]); 
  
export const jobparameterInHangfire = hangfire.table("jobparameter", { 
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(), 
	jobid: bigint({ mode: "number" }).notNull(), 
	name: text().notNull(), 
	value: text(), 
	updatecount: integer().default(0).notNull(), 
}, (table) => [ 
	index("ix_hangfire_jobparameter_jobidandname").using("btree", table.jobid.asc().nullsLast().op("int8_ops"), table.name.asc().nullsLast().op("int8_ops")), 
	foreignKey({ 
			columns: [table.jobid], 
			foreignColumns: [jobInHangfire.id], 
			name: "jobparameter_jobid_fkey" 
		}).onUpdate("cascade").onDelete("cascade"), 
]); 
  
export const aggregatedcounterInHangfire = hangfire.table("aggregatedcounter", { 
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(), 
	key: text().notNull(), 
	value: bigint({ mode: "number" }).notNull(), 
	expireat: timestamp({ withTimezone: true, mode: 'string' }), 
}, (table) => [ 
	unique("aggregatedcounter_key_key").on(table.key), 
]); 
  
export const listInHangfire = hangfire.table("list", { 
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(), 
	key: text().notNull(), 
	value: text(), 
	expireat: timestamp({ withTimezone: true, mode: 'string' }), 
	updatecount: integer().default(0).notNull(), 
}, (table) => [ 
	index("ix_hangfire_list_expireat").using("btree", table.expireat.asc().nullsLast().op("timestamptz_ops")), 
]); 
  
export const setInHangfire = hangfire.table("set", { 
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(), 
	key: text().notNull(), 
	score: doublePrecision().notNull(), 
	value: text().notNull(), 
	expireat: timestamp({ withTimezone: true, mode: 'string' }), 
	updatecount: integer().default(0).notNull(), 
}, (table) => [ 
	index("ix_hangfire_set_expireat").using("btree", table.expireat.asc().nullsLast().op("timestamptz_ops")), 
	index("ix_hangfire_set_key_score").using("btree", table.key.asc().nullsLast().op("float8_ops"), table.score.asc().nullsLast().op("float8_ops")), 
	unique("set_key_value_key").on(table.value, table.key), 
]); 
  
export const aspNetUserRoles = pgTable("AspNetUserRoles", { 
	userId: uuid("UserId").notNull(), 
	roleId: uuid("RoleId").notNull(), 
}, (table) => [ 
	index("IX_AspNetUserRoles_RoleId").using("btree", table.roleId.asc().nullsLast().op("uuid_ops")), 
	foreignKey({ 
			columns: [table.roleId], 
			foreignColumns: [aspNetRoles.id], 
			name: "FK_AspNetUserRoles_AspNetRoles_RoleId" 
		}).onDelete("cascade"), 
	foreignKey({ 
			columns: [table.userId], 
			foreignColumns: [aspNetUsers.id], 
			name: "FK_AspNetUserRoles_AspNetUsers_UserId" 
		}).onDelete("cascade"), 
	primaryKey({ columns: [table.userId, table.roleId], name: "PK_AspNetUserRoles"}), 
]); 
  
export const aspNetUserLogins = pgTable("AspNetUserLogins", { 
	loginProvider: text("LoginProvider").notNull(), 
	providerKey: text("ProviderKey").notNull(), 
	providerDisplayName: text("ProviderDisplayName"), 
	userId: uuid("UserId").notNull(), 
}, (table) => [ 
	index("IX_AspNetUserLogins_UserId").using("btree", table.userId.asc().nullsLast().op("uuid_ops")), 
	foreignKey({ 
			columns: [table.userId], 
			foreignColumns: [aspNetUsers.id], 
			name: "FK_AspNetUserLogins_AspNetUsers_UserId" 
		}).onDelete("cascade"), 
	primaryKey({ columns: [table.providerKey, table.loginProvider], name: "PK_AspNetUserLogins"}), 
]); 
  
export const aspNetUserTokens = pgTable("AspNetUserTokens", { 
	userId: uuid("UserId").notNull(), 
	loginProvider: text("LoginProvider").notNull(), 
	name: text("Name").notNull(), 
	value: text("Value"), 
}, (table) => [ 
	foreignKey({ 
			columns: [table.userId], 
			foreignColumns: [aspNetUsers.id], 
			name: "FK_AspNetUserTokens_AspNetUsers_UserId" 
		}).onDelete("cascade"), 
	primaryKey({ columns: [table.userId, table.name, table.loginProvider], name: "PK_AspNetUserTokens"}), 
]);
