import { Link } from '@tanstack/react-router';
"use client";


import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowRight, Activity, BarChart2, CalendarCheck2, Layers, Receipt, Search } from "lucide-react";
import { ReportItem, ReportCategory } from "./data";
import { flexRender, Row } from "@tanstack/react-table";

export function ReportsHeader({ total }: { total: number }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="flex gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-300/20 bg-gradient-to-br from-indigo-500/80 to-violet-600/80 shadow-lg">
          <BarChart2 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports Center</h1>
          <p className="mt-1 text-sm text-white/60">Akses {total} laporan siklus akuntansi lengkap.</p>
        </div>
      </div>
      <Badge variant="outline" className="border-white/10 bg-white/5 text-white/60">{total} REPORTS</Badge>
    </div>
  );
}

export function ReportsSummary({ summary, isLoading, isError }: any) {
  return (
    <div className="relative mt-6 overflow-hidden rounded-2xl border border-white/10">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 via-transparent to-violet-500/20 opacity-60" />
      <div className="relative grid grid-cols-1 divide-y divide-white/10 bg-[#0B1226]/90 backdrop-blur md:grid-cols-3 md:divide-x md:divide-y-0">
        <div className="flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/15 text-indigo-300"><Receipt className="h-5 w-5" /></div>
          <div>
            <p className="text-xs uppercase tracking-widest text-white/40">Total Journal</p>
            {isLoading ? <div className="mt-1 h-6 w-16 animate-pulse rounded bg-white/10" /> : <p className="text-2xl font-bold tabular-nums text-white">{isError ? "-" : summary?.totalJournal ?? 0}</p>}
            <p className="mt-0.5 flex items-center gap-1 text-xs text-white/40"><Activity className="h-3 w-3" /> entri tercatat</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/15 text-violet-300"><Layers className="h-5 w-5" /></div>
          <div>
            <p className="text-xs uppercase tracking-widest text-white/40">Active COA</p>
            {isLoading ? <div className="mt-1 h-6 w-16 animate-pulse rounded bg-white/10" /> : <p className="text-2xl font-bold tabular-nums text-white">{isError ? "-" : summary?.activeCoa ?? 0}</p>}
            <p className="text-xs text-white/40">akun aktif</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70"><CalendarCheck2 className="h-5 w-5" /></div>
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-widest text-white/40">Selected Period</p>
            {isLoading ? <div className="mt-1 h-6 w-32 animate-pulse rounded bg-white/10" /> : <p className="truncate text-sm font-semibold text-white">{isError ? "Gagal load" : summary?.activePeriodName}</p>}
            {!isLoading && (
              <div className="mt-1.5 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${summary?.isPeriodOpen ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                <span className={`text-xs ${summary?.isPeriodOpen ? "text-emerald-300" : "text-amber-300/80"}`}>{summary?.isPeriodOpen ? "Open" : "Closed"}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReportCard({ report }: { report: ReportItem }) {
  const Icon = report.icon;
  return (
    <Link to={report.href} className="group flex items-start gap-3 rounded-xl border border-white/10 bg-black/40 p-4 transition-all hover:border-indigo-500/30 hover:bg-white/[0.06]">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-slate-900/80 text-white/80 group-hover:text-white"><Icon className="h-4 w-4" /></div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-white">{report.title}</span>
          <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white/40">{report.step}</span>
        </div>
        <p className="mt-0.5 line-clamp-1 text-xs text-white/50">{report.desc}</p>
        <div className="mt-2 flex items-center gap-1 text-[11px] text-white/30 group-hover:text-indigo-300">
          <span className="truncate">{report.href}</span><ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100" />
        </div>
      </div>
    </Link>
  );
}

export function ReportsSearch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative mt-6">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Cari laporan: journal, ledger, cash flow..." className="h-11 rounded-xl border-white/10 bg-black/40 pl-10 text-sm text-white placeholder:text-white/30" />
    </div>
  );
}

export function ReportsGrid({ filteredRows }: { filteredRows: Row<ReportItem>[] }) {
  // import categories inside to keep simple
  const { CATEGORIES } = require("./data");
  return (
    <div className="space-y-8">
      {CATEGORIES.map((cat: ReportCategory) => {
        const rows = filteredRows.filter((r) => r.original.category === cat.id);
        if (rows.length === 0) return null;
        return (
          <div key={cat.id}>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-white/90">{cat.label}</h2>
              <span className="text-xs text-white/40">{cat.hint}</span>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {rows.map((row) => (
                <div key={row.id}>{flexRender(row.getVisibleCells()[0].column.columnDef.cell, row.getVisibleCells()[0].getContext())}</div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
