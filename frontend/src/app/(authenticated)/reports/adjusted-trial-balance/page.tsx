"use client";

import { useMemo } from "react";
import Link from "next/link";
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
  IconListCheck,
  IconCalendar,
  IconEyeOff,
  IconAlertTriangle,
  IconLoader2,
  IconCircleCheck,
} from "@tabler/icons-react";
import { useGetApiV1ReportsTrialBalanceAdjustedQuery } from "@/lib/generatedApi";

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
              <TableHead className="w-[10%] pl-6 text-center">Ref.</TableHead>
              <TableHead className="w-[50%]">Account</TableHead>
              <TableHead className="w-[15%]">Type</TableHead>
              <TableHead className="w-[12%] text-right">Debit</TableHead>
              <TableHead className="w-[13%] pr-6 text-right">Credit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((r) => (
                <TableRow key={r.accountId}>
                  <TableCell className="pl-6 text-center">
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
                  <TableCell className="font-mono text-xs text-emerald-500 text-right">
                    {(r.debit || 0) > 0 ? formatNumber(r.debit!) : "-"}
                  </TableCell>
                  <TableCell className="pr-6 font-mono text-xs text-red-500 text-right">
                    {(r.credit || 0) > 0 ? formatNumber(r.credit!) : "-"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-xs text-muted-foreground"
                >
                  No accounts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow className="font-bold">
              <TableCell colSpan={3} className="pl-6 text-right">
                Total
              </TableCell>
              <TableCell className="font-mono text-emerald-500 text-right">
                {formatNumber(totalDebit)}
              </TableCell>
              <TableCell className="pr-6 font-mono text-red-500 text-right">
                {formatNumber(totalCredit)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function AdjustedTrialBalancePage() {
  // Menggunakan Hook Auto-Generated RTK Query
  const { data, isLoading, isError, error } =
    useGetApiV1ReportsTrialBalanceAdjustedQuery();

  // Evaluasi jika belum ada periode aktif yang dipilih
  const noPeriod =
    (data as any)?.hasPeriodSelected === false ||
    (error as any)?.status === 404;

  // Transformasi data untuk menghitung saldo Debit/Kredit
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
      return { ...r, debit, credit } as TrialRow;
    });
  }, [data, noPeriod]);

  const totalDebit = useMemo(
    () => rows.reduce((s, r) => s + (Number(r.debit) || 0), 0),
    [rows],
  );

  const totalCredit = useMemo(
    () => rows.reduce((s, r) => s + (Number(r.credit) || 0), 0),
    [rows],
  );

  const isBalanced = useMemo(
    () => Math.abs(totalDebit - totalCredit) < 0.01,
    [totalDebit, totalCredit],
  );

  const errorMessage =
    (error as any)?.data?.message ||
    "Gagal memuat data adjusted trial balance.";

  if (isLoading)
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-center text-muted-foreground">
        <IconLoader2 className="animate-spin" size={16} /> Loading adjusted
        trial balance...
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <IconListCheck className="text-amber-500" size={22} /> Adjusted Trial
          Balance
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          After adjusting entries • IDR
        </p>
      </div>

      {isError && !noPeriod && (
        <Alert variant="destructive">
          <IconAlertTriangle size={16} />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {noPeriod ? (
        <Card className="border-dashed py-16 text-center">
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
                ? "border-emerald-500/20 bg-emerald-500/10"
                : "border-red-500/20 bg-red-500/10"
            }
          >
            <IconCircleCheck size={16} />
            <AlertDescription className="text-xs">
              {isBalanced
                ? "Adjusted TB is balanced"
                : "Unbalanced - check adjusting entries"}
            </AlertDescription>
          </Alert>
        </>
      )}
    </div>
  );
}
