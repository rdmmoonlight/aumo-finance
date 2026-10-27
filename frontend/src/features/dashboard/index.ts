// src/features/dashboard/index.ts

// 1. Export Komponen Utama (Feature Entry Component)
export { default as DashboardFeature } from "./components/content";

// 2. Export Komponen Pendukung (jika dibutuhkan di luar modul)
export { DashboardCharts } from "./components/charts";
export { ExpenseTable, TrendTable } from "./components/tables";

// 3. Export Types & Interfaces
// export type * from "./types";

// 4. Export Utility/Helper spesifik dashboard
// export * from "./utils/formatters";

