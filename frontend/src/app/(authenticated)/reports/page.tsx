"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconReportAnalytics,
  IconClipboardList,
  IconTable,
  IconNotebook,
  IconFileInvoice,
  IconBook,
  IconBooks,
  IconChartBar,
  IconCoins,
  IconBuildingBank,
  IconCashBanknote,
  IconFileSpreadsheet,
  IconSearch,
  IconArrowRight,
  IconFileCheck,
} from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type ReportItem = {
  slug: string;
  title: string;
  desc: string;
  category: string;
  step: string;
  icon: any;
};

const REPORTS: ReportItem[] = [
  // Trial Balance Cycle
  {
    slug: "unadjusted-trial-balance",
    title: "Unadjusted Trial Balance",
    desc: "Neraca saldo awal sebelum penyesuaian",
    category: "Trial Balance Cycle",
    step: "01",
    icon: IconClipboardList,
  },
  {
    slug: "worksheet",
    title: "Worksheet",
    desc: "10-column worksheet & kertas kerja",
    category: "Trial Balance Cycle",
    step: "02",
    icon: IconTable,
  },
  {
    slug: "adjusting-journal",
    title: "Adjusting Journal",
    desc: "Jurnal penyesuaian akhir periode",
    category: "Trial Balance Cycle",
    step: "03",
    icon: IconNotebook,
  },
  {
    slug: "adjusted-trial-balance",
    title: "Adjusted Trial Balance",
    desc: "Neraca saldo setelah penyesuaian",
    category: "Trial Balance Cycle",
    step: "04",
    icon: IconFileCheck,
  },
  // Journals & Ledgers
  {
    slug: "general-journal",
    title: "General Journal",
    desc: "Buku harian semua transaksi",
    category: "Journals & Ledgers",
    step: "05",
    icon: IconFileInvoice,
  },
  {
    slug: "general-ledger-temporary",
    title: "General Ledger - Temporary",
    desc: "Buku besar akun nominal",
    category: "Journals & Ledgers",
    step: "06",
    icon: IconBook,
  },
  {
    slug: "general-ledger-permanent",
    title: "General Ledger - Permanent",
    desc: "Buku besar akun riil",
    category: "Journals & Ledgers",
    step: "07",
    icon: IconBooks,
  },
  // Financial Statements
  {
    slug: "income-statement",
    title: "Income Statement",
    desc: "Laporan laba rugi periode berjalan",
    category: "Financial Statements",
    step: "08",
    icon: IconChartBar,
  },
  {
    slug: "retained-earnings",
    title: "Retained Earnings",
    desc: "Laporan perubahan modal & laba ditahan",
    category: "Financial Statements",
    step: "09",
    icon: IconCoins,
  },
  {
    slug: "statement-of-financial-position",
    title: "Financial Position",
    desc: "Neraca / Statement of Financial Position",
    category: "Financial Statements",
    step: "10",
    icon: IconBuildingBank,
  },
  {
    slug: "statement-of-cash-flow",
    title: "Cash Flow Statement",
    desc: "Arus kas operasi, investasi, pendanaan",
    category: "Financial Statements",
    step: "11",
    icon: IconCashBanknote,
  },
  // Closing Cycle
  {
    slug: "closing-journal",
    title: "Closing Journal",
    desc: "Jurnal penutup akun nominal",
    category: "Closing Cycle",
    step: "12",
    icon: IconNotebook,
  },
  {
    slug: "post-closing-trial-balance",
    title: "Post-Closing Trial Balance",
    desc: "Neraca saldo setelah penutupan",
    category: "Closing Cycle",
    step: "13",
    icon: IconFileSpreadsheet,
  },
];

const CATEGORIES = [
  {
    id: "Trial Balance Cycle",
    label: "Trial Balance & Worksheet",
    hint: "Tahap awal hingga penyesuaian",
  },
  {
    id: "Journals & Ledgers",
    label: "Journals & Ledgers",
    hint: "Pencatatan harian & buku besar",
  },
  {
    id: "Financial Statements",
    label: "Financial Statements",
    hint: "Output utama laporan keuangan",
  },
  {
    id: "Closing Cycle",
    label: "Closing Cycle",
    hint: "Penutupan & saldo awal periode baru",
  },
];

export default function ReportsPage() {
  const [q, setQ] = useState("");

  const filtered = REPORTS.filter((r) =>
    `${r.title} ${r.desc} ${r.slug}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="grid w-full place-items-center py-6">
      <Card className="w-full max-w-5xl rounded-2xl border border-white/10 bg-[#0F172A] p-6 text-white shadow-2xl">
        <CardContent className="p-6 md:p-8">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList className="text-white/50">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="hover:text-white">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/20" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">Reports</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-300/20 bg-gradient-to-br from-indigo-500/80 to-violet-600/80 shadow-lg">
                <IconReportAnalytics size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight md:text-2xl">
                  Reports Center
                </h1>
                <p className="mt-1 max-w-xl text-sm leading-relaxed text-white/60">
                  Akses 13 laporan siklus akuntansi lengkap. Dari unadjusted trial balance sampai post-closing. Pilih laporan untuk melihat detail & export.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
              >
                {REPORTS.length} REPORTS
              </Badge>
              <Badge
                variant="outline"
                className="border-white/10 bg-white/5 text-white/60"
              >
                ACCOUNTING CYCLE
              </Badge>
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-6">
            <IconSearch
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
            />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari laporan: journal, ledger, cash flow..."
              className="h-11 rounded-xl border-white/10 bg-black/40 pl-10 text-white placeholder:text-white/30 focus-visible:ring-indigo-500/50"
            />
          </div>

          <Separator className="my-6 bg-white/10" />

          {/* Categories */}
          <div className="space-y-8">
            {CATEGORIES.map((cat) => {
              const items = filtered.filter((r) => r.category === cat.id);
              if (items.length === 0) return null;

              return (
                <div key={cat.id}>
                  <div className="mb-3 flex items-baseline justify-between">
                    <h2 className="text-sm font-semibold tracking-wide text-white/90">
                      {cat.label}
                    </h2>
                    <span className="text- text-white/40">
                      {cat.hint}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {items.map((report) => {
                      const Icon = report.icon;
                      return (
                        <Link
                          key={report.slug}
                          href={`/reports/${report.slug}`}
                          className="group relative flex items-start gap-3 rounded-xl border border-white/10 bg-black/40 p-4 transition-all hover:border-indigo-500/30 hover:bg-white/[0.06]"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-slate-900/80 text-white/80 group-hover:border-indigo-400/30 group-hover:text-white">
                            <Icon size={18} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-sm font-semibold text-white group-hover:text-white">
                                {report.title}
                              </span>
                              <span className="rounded bg-white/10 px-1.5 py-0.5 text- font-mono text-white/40">
                                {report.step}
                              </span>
                            </div>
                            <p className="mt-0.5 line-clamp-1 text-xs text-white/50">
                              {report.desc}
                            </p>
                            <div className="mt-2 flex items-center gap-1 text- text-white/30 group-hover:text-indigo-300">
                              <span>/reports/{report.slug}</span>
                              <IconArrowRight
                                size={12}
                                className="opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                              />
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="mt-10 rounded-xl border border-white/10 bg-black/40 py-10 text-center">
              <p className="text-sm text-white/50">
                Tidak ada laporan untuk &quot;{q}&quot;
              </p>
            </div>
          )}

          {/* Flow Footer */}
          <div className="mt-8 rounded-xl border border-white/10 bg-slate-900/80 p-4">
            <div className="flex flex-wrap items-center gap-2 text- text-white/40">
              <span className="text-white/60">Flow:</span>
              <Badge className="border-0 bg-white/10 text- text-white/60">UTB</Badge>
              <span>→</span>
              <Badge className="border-0 bg-white/10 text- text-white/60">Worksheet</Badge>
              <span>→</span>
              <Badge className="border-0 bg-amber-500/15 text- text-amber-300">ATB</Badge>
              <span>→</span>
              <Badge className="border-0 bg-indigo-500/20 text- text-indigo-300">Financial Statements</Badge>
              <span>→</span>
              <Badge className="border-0 bg-emerald-500/15 text- text-emerald-300">PCTB</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}