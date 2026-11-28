"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";
import { useMemo } from "react";

export interface AiSummaryCardProps {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  totalLiquid: number;
  totalLiabilities: number;
  periodLabel: string;
  periodName?: string;
}

type Tone = "good" | "warn" | "bad";

const toneClass: Record<Tone, string> = {
  good: "text-emerald-500",
  warn: "text-amber-500",
  bad: "text-red-500",
};

const rupiah = (n: number) =>
  `Rp ${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(Math.abs(n))}`;

const pct = (n: number) =>
  `${n.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%`;

export function AiSummaryCard({
  totalRevenue,
  totalExpenses,
  netIncome,
  totalLiquid,
  totalLiabilities,
  periodLabel,
  periodName,
}: AiSummaryCardProps) {
  const summary = useMemo(() => {
    const hasActivity = totalRevenue !== 0 || totalExpenses !== 0;
    const margin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;
    const expenseRatio =
      totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0;
    const coverage =
      totalLiabilities > 0 ? totalLiquid / totalLiabilities : null;

    const metrics: { label: string; value: string; tone: Tone }[] = [
      {
        label: "Margin Laba",
        value: totalRevenue > 0 ? pct(margin) : "-",
        tone: margin >= 10 ? "good" : margin >= 0 ? "warn" : "bad",
      },
      {
        label: "Rasio Beban",
        value: totalRevenue > 0 ? pct(expenseRatio) : "-",
        tone:
          expenseRatio <= 80 ? "good" : expenseRatio <= 100 ? "warn" : "bad",
      },
      {
        label: "Cakupan Kas",
        value: coverage === null ? "Tanpa utang" : `${coverage.toFixed(1)}x`,
        tone:
          coverage === null || coverage >= 1.5
            ? "good"
            : coverage >= 1
              ? "warn"
              : "bad",
      },
    ];

    if (!hasActivity) {
      return {
        text: "Belum ada pendapatan atau beban yang tercatat pada periode ini.",
        metrics,
      };
    }

    const profitText =
      netIncome >= 0
        ? `Periode ${periodLabel} membukukan laba bersih ${rupiah(netIncome)}${
            totalRevenue > 0 ? ` (margin ${pct(margin)})` : ""
          }.`
        : `Periode ${periodLabel} mencatat rugi bersih ${rupiah(netIncome)}; beban melampaui pendapatan.`;

    const expenseText =
      totalRevenue > 0
        ? ` Beban menyerap ${pct(expenseRatio)} dari pendapatan.`
        : "";

    const liquidityText =
      coverage === null
        ? ` Tidak ada kewajiban tercatat; kas dan bank sebesar ${rupiah(totalLiquid)}.`
        : coverage >= 1
          ? ` Kas dan bank menutup kewajiban ${coverage.toFixed(1)} kali.`
          : ` Kas dan bank hanya menutup ${pct(coverage * 100)} dari kewajiban.`;

    return { text: profitText + expenseText + liquidityText, metrics };
  }, [
    totalRevenue,
    totalExpenses,
    netIncome,
    totalLiquid,
    totalLiabilities,
    periodLabel,
  ]);

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="outline"
            className="gap-1.5 border-primary/30 text-primary text-label-small"
          >
            <Zap size={12} /> RINGKASAN LANGSUNG
          </Badge>
          {periodName && (
            <span className="text-caption text-muted-foreground truncate">
              {periodName}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-ui leading-relaxed">{summary.text}</p>

        <div className="grid grid-cols-3 gap-2">
          {summary.metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-lg border bg-background/60 px-3 py-2"
            >
              <p className="text-caption text-muted-foreground">{m.label}</p>
              <p className={cn("font-mono font-bold", toneClass[m.tone])}>
                {m.value}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
