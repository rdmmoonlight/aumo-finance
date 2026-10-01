import { relations } from "drizzle-orm/relations";
import { aspNetRoles, aspNetRoleClaims, aspNetUsers, aspNetUserClaims, journalEntries, notifications, economicDocuments, folders, chartOfAccounts, journalEntryLines, recoveryCodes, securitySettings, userSessions, loginActivities, trustedDevices, jobInHangfire, stateInHangfire, jobparameterInHangfire, aspNetUserRoles, aspNetUserLogins, aspNetUserTokens } from "./schema";

export const aspNetRoleClaimsRelations = relations(aspNetRoleClaims, ({one}) => ({
	aspNetRole: one(aspNetRoles, {
		fields: [aspNetRoleClaims.roleId],
		references: [aspNetRoles.id]
	}),
}));

export const aspNetRolesRelations = relations(aspNetRoles, ({many}) => ({
	aspNetRoleClaims: many(aspNetRoleClaims),
	aspNetUserRoles: many(aspNetUserRoles),
}));

export const aspNetUserClaimsRelations = relations(aspNetUserClaims, ({one}) => ({
	aspNetUser: one(aspNetUsers, {
		fields: [aspNetUserClaims.userId],
		references: [aspNetUsers.id]
	}),
}));

export const aspNetUsersRelations = relations(aspNetUsers, ({many}) => ({
	aspNetUserClaims: many(aspNetUserClaims),
	journalEntries: many(journalEntries),
	notifications: many(notifications),
	recoveryCodes: many(recoveryCodes),
	securitySettings: many(securitySettings),
	userSessions: many(userSessions),
	loginActivities: many(loginActivities),
	trustedDevices: many(trustedDevices),
	aspNetUserRoles: many(aspNetUserRoles),
	aspNetUserLogins: many(aspNetUserLogins),
	aspNetUserTokens: many(aspNetUserTokens),
}));

export const journalEntriesRelations = relations(journalEntries, ({one, many}) => ({
	aspNetUser: one(aspNetUsers, {
		fields: [journalEntries.userId],
		references: [aspNetUsers.id]
	}),
	economicDocuments: many(economicDocuments),
	journalEntryLines: many(journalEntryLines),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	aspNetUser: one(aspNetUsers, {
		fields: [notifications.userId],
		references: [aspNetUsers.id]
	}),
}));

export const economicDocumentsRelations = relations(economicDocuments, ({one}) => ({
	journalEntry: one(journalEntries, {
		fields: [economicDocuments.journalEntryId],
		references: [journalEntries.id]
	}),
	folder: one(folders, {
		fields: [economicDocuments.folderId],
		references: [folders.id]
	}),
}));

export const foldersRelations = relations(folders, ({one, many}) => ({
	economicDocuments: many(economicDocuments),
	folder: one(folders, {
		fields: [folders.parentFolderId],
		references: [folders.id],
		relationName: "folders_parentFolderId_folders_id"
	}),
	folders: many(folders, {
		relationName: "folders_parentFolderId_folders_id"
	}),
}));

export const journalEntryLinesRelations = relations(journalEntryLines, ({one}) => ({
	chartOfAccount: one(chartOfAccounts, {
		fields: [journalEntryLines.accountId],
		references: [chartOfAccounts.id]
	}),
	journalEntry: one(journalEntries, {
		fields: [journalEntryLines.journalEntryId],
		references: [journalEntries.id]
	}),
}));

export const chartOfAccountsRelations = relations(chartOfAccounts, ({many}) => ({
	journalEntryLines: many(journalEntryLines),
}));

export const recoveryCodesRelations = relations(recoveryCodes, ({one}) => ({
	aspNetUser: one(aspNetUsers, {
		fields: [recoveryCodes.userId],
		references: [aspNetUsers.id]
	}),
}));

export const securitySettingsRelations = relations(securitySettings, ({one}) => ({
	aspNetUser: one(aspNetUsers, {
		fields: [securitySettings.userId],
		references: [aspNetUsers.id]
	}),
}));

export const userSessionsRelations = relations(userSessions, ({one}) => ({
	aspNetUser: one(aspNetUsers, {
		fields: [userSessions.userId],
		references: [aspNetUsers.id]
	}),
}));

export const loginActivitiesRelations = relations(loginActivities, ({one}) => ({
	aspNetUser: one(aspNetUsers, {
		fields: [loginActivities.userId],
		references: [aspNetUsers.id]
	}),
}));

export const trustedDevicesRelations = relations(trustedDevices, ({one}) => ({
	aspNetUser: one(aspNetUsers, {
		fields: [trustedDevices.userId],
		references: [aspNetUsers.id]
	}),
}));

export const stateInHangfireRelations = relations(stateInHangfire, ({one}) => ({
	jobInHangfire: one(jobInHangfire, {
		fields: [stateInHangfire.jobid],
		references: [jobInHangfire.id]
	}),
}));

export const jobInHangfireRelations = relations(jobInHangfire, ({many}) => ({
	stateInHangfires: many(stateInHangfire),
	jobparameterInHangfires: many(jobparameterInHangfire),
}));

export const jobparameterInHangfireRelations = relations(jobparameterInHangfire, ({one}) => ({
	jobInHangfire: one(jobInHangfire, {
		fields: [jobparameterInHangfire.jobid],
		references: [jobInHangfire.id]
	}),
}));

export const aspNetUserRolesRelations = relations(aspNetUserRoles, ({one}) => ({
	aspNetRole: one(aspNetRoles, {
		fields: [aspNetUserRoles.roleId],
		references: [aspNetRoles.id]
	}),
	aspNetUser: one(aspNetUsers, {
		fields: [aspNetUserRoles.userId],
		references: [aspNetUsers.id]
	}),
}));

export const aspNetUserLoginsRelations = relations(aspNetUserLogins, ({one}) => ({
	aspNetUser: one(aspNetUsers, {
		fields: [aspNetUserLogins.userId],
		references: [aspNetUsers.id]
	}),
}));

export const aspNetUserTokensRelations = relations(aspNetUserTokens, ({one}) => ({
	aspNetUser: one(aspNetUsers, {
		fields: [aspNetUserTokens.userId],
		references: [aspNetUsers.id]
	}),
}));