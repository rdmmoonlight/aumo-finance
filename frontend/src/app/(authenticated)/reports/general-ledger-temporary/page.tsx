"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  IconBook2,
  IconCalendar,
  IconEyeOff,
  IconAlertTriangle,
  IconLoader2,
  IconTrendingUp,
  IconTrendingDown,
} from "@tabler/icons-react";
import { useGetApiV1ReportsGeneralLedgerTemporaryQuery } from "@/lib/generatedApi";

const formatNumber = (n: number) => {
  if (n === 0) return "-";
  const f = new Intl.NumberFormat("id-ID", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(Math.abs(n));
  return n < 0 ? `(${f})` : f;
};

export default function GeneralLedgerTemporaryPage() {
  const { data, isLoading, isError, error } =
    useGetApiV1ReportsGeneralLedgerTemporaryQuery();

  // Parsing data dari respon API RTK Query
  const responseData = data as any;
  const hasNoPeriod = responseData?.hasPeriodSelected === false;
  const ledgers = responseData?.ledgers || [];
  const netIncome = responseData?.netIncomeBeforeClosing ?? 0;

  if (isLoading) {
    return (
      <div className="py-16 text-center text-muted-foreground flex items-center justify-center gap-2">
        <IconLoader2 className="animate-spin" size={16} /> Loading Temporary
        Ledger...
      </div>
    );
  }

  if (hasNoPeriod) {
    return (
      <Card className="py-16 text-center border-dashed">
        <CardContent className="space-y-3">
          <IconEyeOff size={36} className="mx-auto text-muted-foreground" />
          <h3 className="font-semibold">No Period Selected</h3>
          <Button asChild size="sm">
            <Link href="/periods" className="gap-1.5">
              <IconCalendar size={14} /> Go to Periods
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const errorMessage =
    isError && "data" in (error as any)
      ? (error as any).data?.message || "Failed to load temporary ledger data."
      : "Failed to load temporary ledger data.";

  return (
    <div className="space-y-6">
      {isError && (
        <Alert variant="destructive">
          <IconAlertTriangle size={16} />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <IconBook2 className="text-primary" size={22} /> Temporary Ledger
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Revenue & Expense accounts • {ledgers.length} accounts • IDR
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/reports/general-ledger/permanent">View Permanent</Link>
        </Button>
      </div>

      {/* Card Ringkasan Net Income Sebelum Penutupan */}
      <Card className="bg-muted/20">
        <CardContent className="py-4 flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Net Income (Before Closing)
          </span>
          <div className="flex items-center gap-2 font-mono text-base font-bold">
            {netIncome >= 0 ? (
              <IconTrendingUp className="text-emerald-500" size={20} />
            ) : (
              <IconTrendingDown className="text-red-500" size={20} />
            )}
            <span
              className={netIncome >= 0 ? "text-emerald-600" : "text-red-600"}
            >
              IDR {formatNumber(netIncome)}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {ledgers.map((ledger: any) => (
          <Card key={ledger.accountId} className="overflow-hidden">
            <CardHeader className="py-3 px-4 bg-muted/30 border-b flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="font-mono text-amber-500 text-xs"
                >
                  {ledger.referenceNumber}
                </Badge>
                <span className="font-semibold text-sm">
                  {ledger.accountName}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {ledger.type}
                </Badge>
              </div>
              <span className="font-mono text-xs font-semibold text-emerald-500">
                Ending: {formatNumber(ledger.endingBalance)}
              </span>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="text-xs">
                    <TableHead className="pl-6">Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                    <TableHead className="text-right pr-6">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledger.lines?.length ? (
                    ledger.lines.map((line: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="pl-6 text-xs text-muted-foreground">
                          {line.entryDate}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {line.description || "-"}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-emerald-500">
                          {line.debit > 0 ? formatNumber(line.debit) : "-"}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-red-500">
                          {line.credit > 0 ? formatNumber(line.credit) : "-"}
                        </TableCell>
                        <TableCell className="text-right pr-6 font-mono text-xs font-medium">
                          {formatNumber(line.runningBalance)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-6 text-xs text-muted-foreground"
                      >
                        No postings
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}