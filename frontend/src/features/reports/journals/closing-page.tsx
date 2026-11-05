"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { store } from "@/lib/store";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Info, Loader2, Lock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { reportsApi } from "../api/reportsApi";
import { ClosingGroupTable } from "./_components/closing-group-table";
import { NoPeriodState } from "./_components/no-period-state";
import { formatNumberWithParen } from "./_lib/format";
import { ClosingJournalViewModel } from "./_lib/types";

export default function ClosingJournalReportPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchClosingJournal() {
      setIsLoading(true);
      setIsError(false);
      try {
        const result = await store.dispatch(
          reportsApi.endpoints.getJournalsClosing.initiate(),
        );
        if (isMounted) {
          if (result.isSuccess) setData(result.data);
          else setIsError(true);
        }
      } catch {
        if (isMounted) setIsError(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchClosingJournal();
    return () => {
      isMounted = false;
    };
  }, []);

  const { noPeriod, notClosed, vm } = useMemo(() => {
    const d = data as any;
    if (!d || d?.hasPeriodSelected === false) {
      return {
        noPeriod: true,
        notClosed: false,
        vm: {
          netIncome: 0,
          retainedEarningsAccountName: "Retained Earnings",
          groups: [],
        } as ClosingJournalViewModel,
      };
    }
    if (d?.isPeriodClosed === false) {
      return {
        noPeriod: false,
        notClosed: true,
        vm: {
          netIncome: 0,
          retainedEarningsAccountName: "Retained Earnings",
          groups: [],
        } as ClosingJournalViewModel,
      };
    }
    const cj = d?.closingJournal || d;
    return {
      noPeriod: false,
      notClosed: false,
      vm: {
        netIncome: Number(cj?.netIncome) || 0,
        retainedEarningsAccountName:
          cj?.retainedEarningsAccountName || "Retained Earnings",
        groups: (cj?.groups || []).map((g: any) => ({
          description: g.description,
          lines: g.lines,
        })),
      } as ClosingJournalViewModel,
    };
  }, [data]);

  const totals = useMemo(
    () =>
      vm.groups.map((g) => ({
        totalDebit: g.lines.reduce((s, l) => s + (l.debit || 0), 0),
        totalCredit: g.lines.reduce((s, l) => s + (l.credit || 0), 0),
      })),
    [vm],
  );

  if (isLoading)
    return (
      <div className="py-16 text-center text-xs flex justify-center items-center gap-2">
        <Loader2 className="animate-spin" size={16} /> Loading...
      </div>
    );
  if (isError)
    return (
      <div className="py-16 text-center text-xs text-destructive">
        Gagal mengambil data laporan jurnal penutup dari server.
      </div>
    );
  if (noPeriod) return <NoPeriodState />;
  if (notClosed)
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Lock className="text-amber-500" size={22} /> Closing Journal
        </h1>
        <Alert className="bg-amber-500/10">
          <Info size={16} />
          <AlertDescription className="text-xs space-y-3">
            <p>
              Periode{" "}
              {data?.selectedPeriodName
                ? `"${data.selectedPeriodName}" `
                : "ini "}
              belum ditutup (closed), sehingga Jurnal Penutup belum dibuat.
              Jurnal ini baru tersedia setelah periode ditutup melalui halaman
              Periods.
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
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Lock className="text-amber-500" size={22} /> Closing Journal
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link to="/reports/trial-balances/post-closing">
            <ArrowRight size={14} /> Post-Closing
          </Link>
        </Button>
      </div>

      {vm.groups.length === 0 && (
        <div className="py-12 text-center text-xs text-muted-foreground">
          Belum ada akun pendapatan atau beban yang bersaldo pada periode ini,
          sehingga tidak ada jurnal penutup.
        </div>
      )}

      {vm.groups.map((g, i) => (
        <ClosingGroupTable key={i} group={g} totals={totals[i]} />
      ))}

      <Alert className="bg-sky-500/10">
        <Info size={16} />
        <AlertDescription className="text-xs">
          Net Income <strong>{formatNumberWithParen(vm.netIncome)}</strong> will
          transfer to <strong>{vm.retainedEarningsAccountName}</strong>
        </AlertDescription>
      </Alert>
    </div>
  );
}
