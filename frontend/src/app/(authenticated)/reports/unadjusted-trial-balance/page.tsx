"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useGetApiV1ReportsTrialBalanceUnadjustedQuery } from "@/lib/generatedApi";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  IconList,
  IconCalendar,
  IconEyeOff,
  IconAlertTriangle,
  IconLoader2,
  IconCircleCheck,
} from "@tabler/icons-react";

export interface TrialRow {
  accountId: number;
  referenceNumber: number;
  accountName: string;
  type: string;
  normalBalanceIsDebit: boolean;
  netBalance?: number;
  debit?: number;
  credit?: number;
  amount?: number;
}

const formatNumber = (n: number) =>
  n === 0
    ? "-"
    : new Intl.NumberFormat("id-ID", {
        style: "decimal",
        maximumFractionDigits: 0,
      }).format(Math.abs(n));

function TrialTable({
  rows,
  totalDebit,
  totalCredit,
}: {
  rows: TrialRow[];
  totalDebit: number;
  totalCredit: number;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center pl-6 w-[10%]">Ref.</TableHead>
              <TableHead className="w-[50%]">Account</TableHead>
              <TableHead className="w-[15%]">Type</TableHead>
              <TableHead className="text-right w-[12%]">Debit</TableHead>
              <TableHead className="text-right pr-6 w-[13%]">Credit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((r, idx) => (
                <TableRow key={r.accountId || idx}>
                  <TableCell className="text-center pl-6">
                    <Badge
                      variant="outline"
                      className="font-mono text-amber-500"
                    >
                      {r.referenceNumber || "-"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-medium">
                    {r.accountName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{r.type}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-emerald-500">
                    {(r.debit || 0) > 0 ? formatNumber(r.debit!) : "-"}
                  </TableCell>
                  <TableCell className="text-right pr-6 font-mono text-xs text-red-500">
                    {(r.credit || 0) > 0 ? formatNumber(r.credit!) : "-"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground text-xs"
                >
                  No accounts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow className="font-bold">
              <TableCell colSpan={3} className="text-right pl-6">
                Total
              </TableCell>
              <TableCell className="text-right font-mono text-emerald-500">
                {formatNumber(totalDebit)}
              </TableCell>
              <TableCell className="text-right pr-6 font-mono text-red-500">
                {formatNumber(totalCredit)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function UnadjustedTrialBalancePage() {
  // Panggil RTK Query auto-generated hook
  const { data, isLoading, isError, error } =
    useGetApiV1ReportsTrialBalanceUnadjustedQuery();

  // Evaluasi jika belum ada periode dipilih (Response 404 / Object status khusus)
  const noPeriod = useMemo(() => {
    if (!data) return false;
    if ((data as any)?.hasPeriodSelected === false) return true;
    if (isError && (error as any)?.status === 404) return true;
    return false;
  }, [data, isError, error]);

  // Kalkulasi & Normalisasi Debit / Credit Baris
  const rows = useMemo(() => {
    if (!data || noPeriod) return [];
    const raw: any[] = Array.isArray(data)
      ? data
      : (data as any)?.data || (data as any)?.rows || [];

    return raw.map((r: any) => {
      const net = r.netBalance ?? r.amount ?? 0;
      let debit = r.debit ?? 0;
      let credit = r.credit ?? 0;

      if (r.debit === undefined && r.credit === undefined) {
        if (r.normalBalanceIsDebit) {
          debit = net >= 0 ? net : 0;
          credit = net < 0 ? Math.abs(net) : 0;
        } else {
          credit = net >= 0 ? net : 0;
          debit = net < 0 ? Math.abs(net) : 0;
        }
      }
      return { ...r, debit, credit };
    });
  }, [data, noPeriod]);

  // Total Debit & Credit
  const totalDebit = useMemo(
    () => rows.reduce((s, r) => s + (Number(r.debit) || 0), 0),
    [rows],
  );

  const totalCredit = useMemo(
    () => rows.reduce((s, r) => s + (Number(r.credit) || 0), 0),
    [rows],
  );

  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  // Render State Loading
  if (isLoading) {
    return (
      <div className="py-16 text-center text-muted-foreground flex items-center justify-center gap-2">
        <IconLoader2 className="animate-spin" size={16} /> Loading unadjusted
        trial balance...
      </div>
    );
  }

  // Menentukan Pesan Error
  const errorMessage =
    isError && !noPeriod
      ? (error as any)?.data?.message || "Gagal memuat laporan trial balance."
      : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <IconList className="text-sky-500" size={22} /> Unadjusted Trial
            Balance
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Before adjustments • IDR
          </p>
        </div>
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <IconAlertTriangle size={16} />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {noPeriod ? (
        <Card className="py-16 text-center border-dashed">
          <CardContent className="space-y-3">
            <IconEyeOff size={36} className="mx-auto text-muted-foreground" />
            <h3 className="font-semibold">No Period Selected</h3>
            <p className="text-sm text-muted-foreground">
              Select a period to view trial balance.
            </p>
            <Button asChild size="sm">
              <Link href="/periods" className="gap-1.5">
                <IconCalendar size={14} /> Go to Periods
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <TrialTable
            rows={rows}
            totalDebit={totalDebit}
            totalCredit={totalCredit}
          />
          <Alert
            className={
              isBalanced
                ? "bg-emerald-500/10 border-emerald-500/20"
                : "bg-red-500/10 border-red-500/20"
            }
          >
            <IconCircleCheck size={16} />
            <AlertDescription className="text-xs">
              {isBalanced
                ? "Balanced: Debit = Credit"
                : "Unbalanced - check journal entries"}
            </AlertDescription>
          </Alert>
        </>
      )}
    </div>
  );
}
