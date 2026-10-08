import { relations } from "drizzle-orm";
import {
    chartOfAccounts,
    journalEntries,
    journalEntryLines,
    periods,
    transactionCounters,
    userSettings,
} from "./accounting.schema";
import { roles, userClaims, userLogins, userRoles, users } from "./auth.schema";
import { loginActivities, sessions } from "./guardian.schema";
import { notifications } from "./notifications.schema";

// Re-export semua table biar bisa di-import dari 1 pintu
export * from "./accounting.schema";
export * from "./auth.schema";
export * from "./guardian.schema";
export * from "./notifications.schema";

// ==========================================
// RELATIONS (pusat di sini biar gak circular)
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