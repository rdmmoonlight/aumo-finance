"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useGetApiV1ReportsStatementOfFinancialPositionQuery } from "@/lib/generatedApi";
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
  IconShieldCheck,
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
  debit?: number;
  credit?: number;
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
              rows.map((r) => (
                <TableRow key={`${r.type}-${r.accountName}`}>
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

export default function PostClosingTrialBalancePage() {
  // 1. Eksekusi Query RTK dengan isPostClosing: true
  const { data, isLoading, isError, error } =
    useGetApiV1ReportsStatementOfFinancialPositionQuery({
      isPostClosing: true,
    });

  // 2. Format error message
  const errorMessage = useMemo(() => {
    if (!isError || !error) return null;
    if ("data" in error && (error.data as any)?.message) {
      return (error.data as any).message;
    }
    return "Failed to load post-closing trial balance.";
  }, [isError, error]);

  // 3. Cek apakah ada periode yang dipilih
  const noPeriod = useMemo(() => {
    if ((error as any)?.status === 404) return true;
    return (data as any)?.hasPeriodSelected === false;
  }, [data, error]);

  // 4. Transformasi data Neraca ke format Post-Closing Trial Balance
  const rows = useMemo<TrialRow[]>(() => {
    if (!data || noPeriod) return [];

    const rawData = data as any;
    const assets = rawData?.assetAccounts || rawData?.assets || [];
    const liabs = rawData?.liabilityAccounts || rawData?.liabilities || [];
    const rawEquity =
      rawData?.equityAccounts || rawData?.equityExcludingRetainedEarnings || [];

    const reItem = rawEquity.find(
      (e: any) => e.accountName === "Retained Earnings",
    );
    const reEnding = reItem
      ? Number(reItem.amount)
      : Number(rawData?.retainedEarningsEnding) || 0;

    const equityEx = rawEquity.filter(
      (e: any) => e.accountName !== "Retained Earnings",
    );

    return [
      ...assets.map((a: any) => ({
        accountId: a.accountId || a.referenceNumber,
        referenceNumber: a.referenceNumber,
        accountName: a.accountName,
        type: "Assets",
        normalBalanceIsDebit: true,
        debit: Number(a.amount) || 0,
        credit: 0,
      })),
      ...liabs.map((l: any) => ({
        accountId: l.accountId || l.referenceNumber,
        referenceNumber: l.referenceNumber,
        accountName: l.accountName,
        type: "Liabilities",
        normalBalanceIsDebit: false,
        debit: 0,
        credit: Number(l.amount) || 0,
      })),
      ...equityEx.map((e: any) => ({
        accountId: e.accountId || e.referenceNumber,
        referenceNumber: e.referenceNumber,
        accountName: e.accountName,
        type: "Equity",
        normalBalanceIsDebit: false,
        debit: 0,
        credit: Number(e.amount) || 0,
      })),
      {
        accountId: 0,
        referenceNumber: 0,
        accountName: "Retained Earnings",
        type: "Equity",
        normalBalanceIsDebit: false,
        debit: reEnding < 0 ? Math.abs(reEnding) : 0,
        credit: reEnding >= 0 ? reEnding : 0,
      },
    ];
  }, [data, noPeriod]);

  // 5. Hitung total Debit, Credit & Balance
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

  if (isLoading) {
    return (
      <div className="py-16 text-center text-muted-foreground flex items-center justify-center gap-2">
        <IconLoader2 className="animate-spin" size={16} /> Loading post-closing
        trial balance...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <IconShieldCheck className="text-emerald-500" size={22} />{" "}
          Post-Closing Trial Balance
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          After closing entries • Only permanent accounts • IDR
        </p>
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
              Select a period to view post-closing balance.
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
                ? "Post-closing TB is balanced - ready for next period"
                : "Out of balance - check closing entries"}
            </AlertDescription>
          </Alert>
        </>
      )}
    </div>
  );
}
