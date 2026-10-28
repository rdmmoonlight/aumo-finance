import {
  Banknote,
  BarChart3,
  Book,
  BookOpen,
  Building2,
  ClipboardList,
  Coins,
  FileCheck,
  FileSpreadsheet,
  Library,
  Receipt,
  Table as TableIcon,
  LucideIcon,
} from "lucide-react";

export type ReportItem = {
  href: string;
  title: string;
  desc: string;
  category: string;
  step: string;
  icon: LucideIcon;
};

export type ReportCategory = {
  id: string;
  label: string;
  hint: string;
};

export const REPORTS: ReportItem[] = [
  { href: "/reports/journals/general", title: "General Journal", desc: "Buku harian semua transaksi", category: "Journals & Ledgers", step: "01", icon: Receipt },
  { href: "/reports/general-ledgers/permanent", title: "General Ledger - Permanent", desc: "Buku besar akun riil", category: "Journals & Ledgers", step: "02", icon: Library },
  { href: "/reports/general-ledgers/temporary", title: "General Ledger - Temporary", desc: "Buku besar akun nominal", category: "Journals & Ledgers", step: "03", icon: Book },
  { href: "/reports/trial-balances/unadjusted", title: "Unadjusted Trial Balance", desc: "Neraca saldo awal sebelum penyesuaian", category: "Trial Balance Cycle", step: "04", icon: ClipboardList },
  { href: "/reports/worksheet", title: "Worksheet", desc: "10-column worksheet & kertas kerja", category: "Trial Balance Cycle", step: "05", icon: TableIcon },
  { href: "/reports/journals/adjusting", title: "Adjusting Journal", desc: "Jurnal penyesuaian akhir periode", category: "Trial Balance Cycle", step: "06", icon: BookOpen },
  { href: "/reports/trial-balances/adjusted", title: "Adjusted Trial Balance", desc: "Neraca saldo setelah penyesuaian", category: "Trial Balance Cycle", step: "07", icon: FileCheck },
  { href: "/reports/financial-statements/income-statement", title: "Income Statement", desc: "Laporan laba rugi periode berjalan", category: "Financial Statements", step: "08", icon: BarChart3 },
  { href: "/reports/financial-statements/retained-earnings", title: "Retained Earnings", desc: "Laporan perubahan modal & laba ditahan", category: "Financial Statements", step: "09", icon: Coins },
  { href: "/reports/financial-statements/statement-of-financial-position", title: "Financial Position", desc: "Neraca / Statement of Financial Position", category: "Financial Statements", step: "10", icon: Building2 },
  { href: "/reports/financial-statements/statement-of-cash-flow", title: "Cash Flow Statement", desc: "Arus kas operasi, investasi, pendanaan", category: "Financial Statements", step: "11", icon: Banknote },
  { href: "/reports/journals/closing", title: "Closing Journal", desc: "Jurnal penutup akun nominal", category: "Closing Cycle", step: "12", icon: BookOpen },
  { href: "/reports/trial-balances/post-closing", title: "Post-Closing Trial Balance", desc: "Neraca saldo setelah penutupan", category: "Closing Cycle", step: "13", icon: FileSpreadsheet },
];

export const CATEGORIES: ReportCategory[] = [
  { id: "Journals & Ledgers", label: "Journals & Ledgers", hint: "Pencatatan harian & buku besar" },
  { id: "Trial Balance Cycle", label: "Trial Balance & Worksheet", hint: "Tahap awal hingga penyesuaian" },
  { id: "Financial Statements", label: "Financial Statements", hint: "Output utama laporan keuangan" },
  { id: "Closing Cycle", label: "Closing Cycle", hint: "Penutupan & saldo awal periode baru" },
];
