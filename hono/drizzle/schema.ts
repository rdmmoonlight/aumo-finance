import { pgTable, serial, date, varchar, numeric, timestamp, index, uniqueIndex, integer, text, boolean, uuid, foreignKey, unique } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const dataProtectionKeys = pgTable("DataProtectionKeys", {
	id: integer("Id").primaryKey().generatedByDefaultAsIdentity({ name: ""DataProtectionKeys_Id_seq"", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647 }),
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
]);

export const securitySettings = pgTable("SecuritySettings", {
	userId: uuid("UserId").primaryKey().notNull(),
	emailVerified: boolean("EmailVerified").default(false).notNull(),
	twoFactorEnabled: boolean("TwoFactorEnabled").default(false).notNull(),
	loginNotificationEnabled: boolean("LoginNotificationEnabled").default(true).notNull(),
	sessionTimeoutMinutes: integer("SessionTimeoutMinutes").default(30).notNull(),
	updatedAt: timestamp("UpdatedAt", { withTimezone: true, mode: 'string' }).notNull(),
});

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
	unique("TrustedDevices_DeviceIdentifier_key").on(table.deviceIdentifier),
]);