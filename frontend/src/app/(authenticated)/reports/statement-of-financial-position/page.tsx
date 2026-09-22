"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useGetApiV1ReportsStatementOfFinancialPositionQuery } from "@/lib/generatedApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  IconBuildingBank,
  IconCalendar,
  IconEyeOff,
  IconArrowRight,
  IconAlertTriangle,
  IconLoader2,
  IconCircleCheck,
  IconAlertCircle,
} from "@tabler/icons-react";

export interface FinancialPositionLine {
  referenceNumber?: number | string;
  accountName?: string;
  amount?: number | string;
}

const formatNumber = (n: number) => {
  const f = new Intl.NumberFormat("id-ID", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(Math.abs(n));
  return n < 0 ? `(${f})` : f;
};

const formatDateDisplay = (s?: string) =>
  !s
    ? ""
    : new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(s));

export default function StatementOfFinancialPositionPage() {
  // Menggunakan Hook Auto-Generated RTK Query
  const { data, isLoading, isError, error, refetch } =
    useGetApiV1ReportsStatementOfFinancialPositionQuery({});

  // Mengecek apakah periode belum dipilih dari respon API
  const noPeriod = (data as any)?.hasPeriodSelected === false;

  // Parsing data Assets, Liabilities, & Equity secara declarative
  const {
    assets,
    liabilities,
    equityExcludingRE,
    retainedEarningsEnding,
    asOfDate,
  } = useMemo(() => {
    const rawData = data as any;
    const assetsList: FinancialPositionLine[] =
      rawData?.assetAccounts || rawData?.assets || [];
    const liabList: FinancialPositionLine[] =
      rawData?.liabilityAccounts || rawData?.liabilities || [];
    const rawEquity: FinancialPositionLine[] =
      rawData?.equityAccounts || rawData?.equityExcludingRetainedEarnings || [];

    const equityExcludingRE = rawEquity.filter(
      (e) => e.accountName !== "Retained Earnings",
    );
    const reItem = rawEquity.find((e) => e.accountName === "Retained Earnings");

    return {
      assets: assetsList,
      liabilities: liabList,
      equityExcludingRE,
      retainedEarningsEnding: reItem
        ? Number(reItem.amount)
        : Number(rawData?.retainedEarningsEnding) || 0,
      asOfDate: rawData?.asOfDate || "",
    };
  }, [data]);

  // Kalkulasi Total Finansial
  const totalAssets = useMemo(
    () => assets.reduce((s, i) => s + (Number(i.amount) || 0), 0),
    [assets],
  );

  const totalLiabilities = useMemo(
    () => liabilities.reduce((s, i) => s + (Number(i.amount) || 0), 0),
    [liabilities],
  );

  const totalEquity = useMemo(
    () =>
      equityExcludingRE.reduce((s, i) => s + (Number(i.amount) || 0), 0) +
      retainedEarningsEnding,
    [equityExcludingRE, retainedEarningsEnding],
  );

  const totalLiabEquity = totalLiabilities + totalEquity;
  const isBalanced = Math.abs(totalAssets - totalLiabEquity) < 0.01;

  if (isLoading) {
    return (
      <div className="py-16 text-center text-muted-foreground flex items-center justify-center gap-2">
        <IconLoader2 className="animate-spin" size={16} /> Loading Balance
        Sheet...
      </div>
    );
  }

  const errorMessage = isError
    ? (error as any)?.data?.message || "Gagal memuat laporan posisi keuangan."
    : null;

  return (
    <div className="space-y-6">
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
            <Button asChild size="sm">
              <Link href="/periods" className="gap-1.5">
                <IconCalendar size={14} /> Go to Periods
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <IconBuildingBank className="text-sky-500" size={22} />{" "}
                Statement of Financial Position
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                As of {formatDateDisplay(asOfDate) || "current period"} • IAS 1
                • IDR
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="text-xs"
              >
                Refresh Data
              </Button>
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <Link href="/reports/closing-journal">
                  <IconArrowRight size={14} /> Closing Journal
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 items-start">
            {/* Aktiva / Assets */}
            <Card className="overflow-hidden">
              <CardHeader className="py-3 bg-muted/30 border-b">
                <CardTitle className="tracking-widest uppercase text-amber-500 text-sm">
                  Assets
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y text-sm">
                  {assets.length === 0 ? (
                    <div className="p-4 text-xs text-muted-foreground italic">
                      No assets.
                    </div>
                  ) : (
                    assets.map((l, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 px-4"
                      >
                        <span className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="font-mono text-xs"
                          >
                            {l.referenceNumber}
                          </Badge>
                          {l.accountName}
                        </span>
                        <span className="font-mono text-xs">
                          {formatNumber(Number(l.amount) || 0)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex items-center justify-between p-4 border-t font-bold bg-muted/20">
                  <span>Total Assets</span>
                  <span className="font-mono text-sky-500">
                    {formatNumber(totalAssets)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Kewajiban & Ekuitas / Liabilities & Equity */}
            <div className="space-y-4">
              <Card className="overflow-hidden">
                <CardHeader className="py-3 bg-muted/30 border-b">
                  <CardTitle className="tracking-widest uppercase text-amber-500 text-sm">
                    Liabilities
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y text-sm">
                    {liabilities.length === 0 ? (
                      <div className="p-4 text-xs text-muted-foreground italic">
                        No liabilities.
                      </div>
                    ) : (
                      liabilities.map((l, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 px-4"
                        >
                          <span className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="font-mono text-xs"
                            >
                              {l.referenceNumber}
                            </Badge>
                            {l.accountName}
                          </span>
                          <span className="font-mono text-xs">
                            {formatNumber(Number(l.amount) || 0)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex items-center justify-between p-4 border-t font-semibold">
                    <span>Total Liabilities</span>
                    <span className="font-mono">
                      {formatNumber(totalLiabilities)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <CardHeader className="py-3 bg-muted/30 border-b">
                  <CardTitle className="tracking-widest uppercase text-amber-500 text-sm">
                    Equity
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y text-sm">
                    {equityExcludingRE.map((l, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 px-4"
                      >
                        <span className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="font-mono text-xs"
                          >
                            {l.referenceNumber}
                          </Badge>
                          {l.accountName}
                        </span>
                        <span className="font-mono text-xs">
                          {formatNumber(Number(l.amount) || 0)}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between p-3 px-4">
                      <span>
                        Retained earnings, {formatDateDisplay(asOfDate)}
                      </span>
                      <span className="font-mono text-xs">
                        {formatNumber(retainedEarningsEnding)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border-t font-semibold">
                    <span>Total Equity</span>
                    <span className="font-mono">
                      {formatNumber(totalEquity)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4 flex items-center justify-between font-bold text-base">
                  <span>Total Liabilities & Equity</span>
                  <span className="font-mono text-sky-500">
                    {formatNumber(totalLiabEquity)}
                  </span>
                </CardContent>
              </Card>
            </div>
          </div>

          <Alert
            className={
              isBalanced
                ? "bg-emerald-500/10 border-emerald-500/20"
                : "bg-red-500/10 border-red-500/20"
            }
          >
            {isBalanced ? (
              <IconCircleCheck size={16} className="text-emerald-500" />
            ) : (
              <IconAlertCircle size={16} className="text-red-500" />
            )}
            <AlertDescription className="text-xs">
              {isBalanced
                ? "Total Assets = Total Liabilities + Equity. Balanced."
                : "Total Assets ≠ Total Liabilities + Equity. Check journal entries."}
            </AlertDescription>
          </Alert>
        </>
      )}
    </div>
  );
}
