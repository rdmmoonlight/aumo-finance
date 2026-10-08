import { relations } from "drizzle-orm";
import { roles, userClaims, userLogins, userRoles, users } from "./auth.schema";
import { generalJournal } from "./reports/general-journal.schema";

// Re-export table
export * from "./auth.schema";
export * from "./reports/general-journal.schema";

// ==========================================
// RELATIONS
// ==========================================

export const usersRelations = relations(users, ({ many }) => ({
    roles: many(userRoles),
    claims: many(userClaims),
    logins: many(userLogins),
    generalJournals: many(generalJournal),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
    user: one(users, { fields: [userRoles.userId], references: [users.id] }),
    role: one(roles, { fields: [userRoles.roleId], references: [roles.id] }),
}));

export const generalJournalRelations = relations(generalJournal, ({ one }) => ({
    user: one(users, {
        fields: [generalJournal.userId],
        references: [users.id],
    }),
}));