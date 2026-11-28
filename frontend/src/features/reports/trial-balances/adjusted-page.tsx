"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, ListChecks, Loader2 } from "lucide-react";
import { useMemo } from "react";
import { useGetTrialBalanceQuery } from "../api/reportsApi";
import { BalanceAlert } from "./_components/balance-alert";
import { NoPeriodCard } from "./_components/no-period-card";
import { TrialTable } from "./_components/trial-table";
import { normalizeTrialRows } from "./_lib/normalize";

export default function AdjustedTrialBalancePage() {
  const { data, isLoading, isError, error } = useGetTrialBalanceQuery({
    type: "adjusted",
  });

  const noPeriod =
    (data as any)?.hasPeriodSelected === false ||
    (error as any)?.status === 404;

  // 2. Normalisasi baris data
  const rows = useMemo(() => {
    if (!data || noPeriod) return [];
    const raw: any[] = Array.isArray(data)
      ? data
      : (data as any)?.data || (data as any)?.rows || [];
    return normalizeTrialRows(raw);
  }, [data, noPeriod]);

  // 3. Kalkulasi total Debet & Kredit
  const totalDebit = useMemo(
    () => rows.reduce((s, r) => s + (Number(r.debit) || 0), 0),
    [rows],
  );
  const totalCredit = useMemo(
    () => rows.reduce((s, r) => s + (Number(r.credit) || 0), 0),
    [rows],
  );
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-caption text-muted-foreground">
        <Loader2 className="animate-spin" size={16} /> Loading adjusted trial
        balance...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-h3 font-bold">
          <ListChecks className="text-amber-500" size={22} /> Adjusted Trial
          Balance
        </h1>
        <p className="mt-1 text-ui text-muted-foreground">
          After adjusting entries • IDR
        </p>
      </div>

      {isError && !noPeriod && (
        <Alert variant="destructive">
          <AlertTriangle size={16} />
          <AlertDescription>
            {(error as any)?.data?.message ||
              "Gagal memuat data adjusted trial balance."}
          </AlertDescription>
        </Alert>
      )}

      {noPeriod ? (
        <NoPeriodCard />
      ) : (
        <>
          <TrialTable
            rows={rows}
            totalDebit={totalDebit}
            totalCredit={totalCredit}
          />
          <BalanceAlert
            isBalanced={isBalanced}
            balancedText="Adjusted TB is balanced"
            unbalancedText="Unbalanced - check adjusting entries"
          />
        </>
      )}
    </div>
  );
}
