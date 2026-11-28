"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Info,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useMemo } from "react";
import { useGetTrialBalanceQuery } from "../api/reportsApi";
import { BalanceAlert } from "./_components/balance-alert";
import { NoPeriodCard } from "./_components/no-period-card";
import { TrialTable } from "./_components/trial-table";
import { normalizeTrialRows } from "./_lib/normalize";
import { TrialRow } from "./_lib/types";

export default function PostClosingTrialBalancePage() {
  const { data, isLoading, isError, error } = useGetTrialBalanceQuery({
    type: "post-closing",
  });

  const { noPeriod, notClosed } = useMemo(() => {
    const raw = data as any;
    const is404 = (error as any)?.status === 404;
    const noPeriodSelected = raw?.hasPeriodSelected === false;

    return {
      noPeriod: is404 || noPeriodSelected,
      notClosed: !noPeriodSelected && raw?.isPeriodClosed === false,
    };
  }, [data, error]);

  const rows = useMemo<TrialRow[]>(() => {
    if (!data || noPeriod || notClosed) return [];
    const raw: any[] = Array.isArray(data)
      ? data
      : (data as any)?.data || (data as any)?.rows || [];
    return normalizeTrialRows(raw);
  }, [data, noPeriod, notClosed]);

  const totalDebit = useMemo(
    () => rows.reduce((s, r) => s + (Number(r.debit) || 0), 0),
    [rows],
  );
  const totalCredit = useMemo(
    () => rows.reduce((s, r) => s + (Number(r.credit) || 0), 0),
    [rows],
  );
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  if (isLoading)
    return (
      <div className="py-16 text-center text-caption text-muted-foreground flex items-center justify-center gap-2">
        <Loader2 className="animate-spin" size={16} /> Loading post-closing...
      </div>
    );

  if (notClosed)
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-h3 font-bold flex items-center gap-2">
            <ShieldCheck className="text-emerald-500" size={22} /> Post-Closing
            Trial Balance
          </h1>
          <p className="text-ui text-muted-foreground mt-1">
            After closing entries • Only permanent accounts • IDR
          </p>
        </div>
        <Alert className="bg-amber-500/10">
          <Info size={16} />
          <AlertDescription className="text-xs space-y-3">
            <p>
              Periode{" "}
              {(data as any)?.selectedPeriodName
                ? `"${(data as any).selectedPeriodName}" `
                : "ini "}
              belum ditutup (closed), sehingga Post-Closing Trial Balance belum
              dibuat. Laporan ini baru tersedia setelah periode ditutup melalui
              halaman Periods.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link to="/periods">
                <ArrowRight size={14} /> Ke halaman Periods
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h3 font-bold flex items-center gap-2">
          <ShieldCheck className="text-emerald-500" size={22} /> Post-Closing
          Trial Balance
        </h1>
        <p className="text-ui text-muted-foreground mt-1">
          After closing entries • Only permanent accounts • IDR
        </p>
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertTriangle size={16} />
          <AlertDescription>
            {(error as any)?.data?.message ||
              "Failed to load post-closing trial balance."}
          </AlertDescription>
        </Alert>
      )}

      {noPeriod ? (
        <NoPeriodCard message="Select a period to view post-closing balance." />
      ) : (
        <>
          <TrialTable
            rows={rows}
            totalDebit={totalDebit}
            totalCredit={totalCredit}
          />
          <BalanceAlert
            isBalanced={isBalanced}
            balancedText="Post-closing TB is balanced - ready for next period"
            unbalancedText="Out of balance - check closing entries"
          />
        </>
      )}
    </div>
  );
}
