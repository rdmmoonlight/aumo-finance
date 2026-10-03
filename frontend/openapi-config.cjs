/** @type {import('@rtk-query/codegen-openapi').ConfigFile} */

// Helper untuk mengecek apakah endpoint memiliki salah satu tag yang ditentukan
const matchTag = (targetTags) => (operationName, opDef) => {
  const tags = opDef.operation?.tags || [];
  return tags.some((t) => targetTags.includes(t));
};

// Daftar seluruh tag utama yang kamu miliki
const KNOWN_TAGS = [
  "Auth",
  "ChartOfAccounts",
  "Dashboard",
  "JournalEntry",
  "Periods",
  "Settings",
  "Summary",
  "Tools",
  "FinancialStatements",
  "GeneralLedger",
  "Journal",
  "Worksheet",
  "MarketData",
];

const config = {
  schemaFile: "https://aumonext-api.onrender.com/openapi/v1.json",
  apiFile: "./src/lib/apiClient.ts",
  apiImport: "baseApi",
  hooks: true,
  tag: true,
  outputFiles: {
    // 1. Auth
    "./src/lib/store/auth/authApi.ts": {
      filterEndpoints: matchTag(["Auth"]),
    },

    // 2. Home
    "./src/lib/store/(authenticated)/home/homeApi.ts": {
      filterEndpoints: matchTag(["MarketData"]),
    },

    // 3. Settings
    "./src/lib/store/(authenticated)/settings/settingsApi.ts": {
      filterEndpoints: matchTag(["Settings"]),
    },

    // 4. Chart of Accounts
    "./src/lib/store/(authenticated)/chart-of-accounts/chartOfAccountsApi.ts": {
      filterEndpoints: matchTag(["ChartOfAccounts"]),
    },

    // 5. Periods
    "./src/lib/store/(authenticated)/periods/periodsApi.ts": {
      filterEndpoints: matchTag(["Periods"]),
    },

    // 6. Journal Entry
    "./src/lib/store/(authenticated)/journal-entry/journalEntryApi.ts": {
      filterEndpoints: matchTag(["JournalEntry"]),
    },

    // 7. Dashboard & Summary
    "./src/lib/store/(authenticated)/dashboard/dashboardApi.ts": {
      filterEndpoints: matchTag(["Dashboard"]),
    },

    // 8. Tools
    "./src/lib/store/(authenticated)/tools/toolsApi.ts": {
      filterEndpoints: matchTag(["Tools"]),
    },

    // 9. Reports (FinancialStatements, GeneralLedger, Journal, Worksheet)
    "./src/lib/store/(authenticated)/reports/reportsApi.ts": {
      filterEndpoints: matchTag([
        "Summary",
        "FinancialStatements",
        "GeneralLedger",
        "Journal",
        "Worksheet",
      ]),
    },

    // 10. Fallback (AumoBackend, Health, Notifications, atau tag lain di luar KNOWN_TAGS)
    "./src/lib/store/commonApi.ts": {
      filterEndpoints: (opName, opDef) => {
        const tags = opDef.operation?.tags || [];
        return !tags.some((t) => KNOWN_TAGS.includes(t));
      },
    },
  },
};

module.exports = config;