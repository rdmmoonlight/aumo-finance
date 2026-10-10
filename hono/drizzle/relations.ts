import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
	jobparameterInHangfire: {
		jobInHangfire: r.one.jobInHangfire({
			from: r.jobparameterInHangfire.jobid,
			to: r.jobInHangfire.id
		}),
	},
	jobInHangfire: {
		jobparameterInHangfires: r.many.jobparameterInHangfire(),
		stateInHangfires: r.many.stateInHangfire(),
	},
	stateInHangfire: {
		jobInHangfire: r.one.jobInHangfire({
			from: r.stateInHangfire.jobid,
			to: r.jobInHangfire.id
		}),
	},
	aspNetRoleClaims: {
		aspNetRole: r.one.aspNetRoles({
			from: r.aspNetRoleClaims.roleId,
			to: r.aspNetRoles.id
		}),
	},
	aspNetRoles: {
		aspNetRoleClaims: r.many.aspNetRoleClaims(),
		aspNetUsers: r.many.aspNetUsers({
			from: r.aspNetRoles.id.through(r.aspNetUserRoles.roleId),
			to: r.aspNetUsers.id.through(r.aspNetUserRoles.userId)
		}),
	},
	aspNetUserClaims: {
		aspNetUser: r.one.aspNetUsers({
			from: r.aspNetUserClaims.userId,
			to: r.aspNetUsers.id
		}),
	},
	aspNetUsers: {
		aspNetUserClaims: r.many.aspNetUserClaims(),
		aspNetUserLogins: r.many.aspNetUserLogins(),
		aspNetRoles: r.many.aspNetRoles(),
		aspNetUserTokens: r.many.aspNetUserTokens(),
		journalEntries: r.many.journalEntries(),
		loginActivities: r.many.loginActivities(),
		notifications: r.many.notifications(),
		recoveryCodes: r.many.recoveryCodes(),
		securitySettings: r.many.securitySettings(),
		trustedDevices: r.many.trustedDevices(),
		userSessions: r.many.userSessions(),
	},
	aspNetUserLogins: {
		aspNetUser: r.one.aspNetUsers({
			from: r.aspNetUserLogins.userId,
			to: r.aspNetUsers.id
		}),
	},
	aspNetUserTokens: {
		aspNetUser: r.one.aspNetUsers({
			from: r.aspNetUserTokens.userId,
			to: r.aspNetUsers.id
		}),
	},
	generalLedgerPermanentAccounts: {
		chartOfAccount: r.one.chartOfAccounts({
			from: r.generalLedgerPermanentAccounts.accountId,
			to: r.chartOfAccounts.id
		}),
		journalEntry: r.one.journalEntries({
			from: r.generalLedgerPermanentAccounts.journalEntryId,
			to: r.journalEntries.id
		}),
		journalEntryLine: r.one.journalEntryLines({
			from: r.generalLedgerPermanentAccounts.journalEntryLineId,
			to: r.journalEntryLines.id
		}),
		period: r.one.periods({
			from: r.generalLedgerPermanentAccounts.periodId,
			to: r.periods.id
		}),
	},
	chartOfAccounts: {
		generalLedgerPermanentAccounts: r.many.generalLedgerPermanentAccounts(),
		generalLedgerTemporaryAccounts: r.many.generalLedgerTemporaryAccounts(),
		journalEntries: r.many.journalEntries({
			from: r.chartOfAccounts.id.through(r.journalEntryLines.accountId),
			to: r.journalEntries.id.through(r.journalEntryLines.journalEntryId)
		}),
	},
	journalEntries: {
		generalLedgerPermanentAccounts: r.many.generalLedgerPermanentAccounts(),
		generalLedgerTemporaryAccounts: r.many.generalLedgerTemporaryAccounts(),
		aspNetUser: r.one.aspNetUsers({
			from: r.journalEntries.userId,
			to: r.aspNetUsers.id
		}),
		chartOfAccounts: r.many.chartOfAccounts(),
	},
	journalEntryLines: {
		generalLedgerPermanentAccounts: r.many.generalLedgerPermanentAccounts(),
		generalLedgerTemporaryAccounts: r.many.generalLedgerTemporaryAccounts(),
	},
	periods: {
		generalLedgerPermanentAccounts: r.many.generalLedgerPermanentAccounts(),
		generalLedgerTemporaryAccounts: r.many.generalLedgerTemporaryAccounts(),
	},
	generalLedgerTemporaryAccounts: {
		chartOfAccount: r.one.chartOfAccounts({
			from: r.generalLedgerTemporaryAccounts.accountId,
			to: r.chartOfAccounts.id
		}),
		journalEntry: r.one.journalEntries({
			from: r.generalLedgerTemporaryAccounts.journalEntryId,
			to: r.journalEntries.id
		}),
		journalEntryLine: r.one.journalEntryLines({
			from: r.generalLedgerTemporaryAccounts.journalEntryLineId,
			to: r.journalEntryLines.id
		}),
		period: r.one.periods({
			from: r.generalLedgerTemporaryAccounts.periodId,
			to: r.periods.id
		}),
	},
	loginActivities: {
		aspNetUser: r.one.aspNetUsers({
			from: r.loginActivities.userId,
			to: r.aspNetUsers.id
		}),
	},
	notifications: {
		aspNetUser: r.one.aspNetUsers({
			from: r.notifications.userId,
			to: r.aspNetUsers.id
		}),
	},
	recoveryCodes: {
		aspNetUser: r.one.aspNetUsers({
			from: r.recoveryCodes.userId,
			to: r.aspNetUsers.id
		}),
	},
	securitySettings: {
		aspNetUser: r.one.aspNetUsers({
			from: r.securitySettings.userId,
			to: r.aspNetUsers.id
		}),
	},
	trustedDevices: {
		aspNetUser: r.one.aspNetUsers({
			from: r.trustedDevices.userId,
			to: r.aspNetUsers.id
		}),
	},
	userSessions: {
		aspNetUser: r.one.aspNetUsers({
			from: r.userSessions.userId,
			to: r.aspNetUsers.id
		}),
	},
}))