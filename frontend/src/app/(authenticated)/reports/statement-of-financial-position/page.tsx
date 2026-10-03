"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { useGetApiV1ReportsStatementOfFinancialPositionQuery } from "@/lib/store/(authenticated)/reports/reportsApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Landmark,
  Calendar,
  EyeOff,
  ArrowRight,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

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

const columnHelper = createColumnHelper<FinancialPositionLine>();

function FinancialPositionSectionTable({
  title,
  lines,
  totalAmount,
  totalLabel,
  emptyMessage,
  totalColorClass = "",
}: {
  title: string;
  lines: FinancialPositionLine[];
  totalAmount: number;
  totalLabel: string;
  emptyMessage: string;
  totalColorClass?: string;
}) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("referenceNumber", {
        header: () => <div className="text-caption">Ref</div>,
        cell: (info) => {
          const val = info.getValue();
          return val ? (
            <Badge variant="outline" className="font-mono text-label-small">
              {val}
            </Badge>
          ) : null;
        },
      }),
      columnHelper.accessor("accountName", {
        header: () => <div className="text-caption">Account</div>,
        cell: (info) => (
          <span className="text-ui font-medium">{info.getValue() || "-"}</span>
        ),
      }),
      columnHelper.accessor("amount", {
        header: () => <div className="text-right text-caption">Amount</div>,
        cell: (info) => (
          <div className="text-right font-mono text-caption">
            {formatNumber(Number(info.getValue()) || 0)}
          </div>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: lines,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader className="py-3 bg-muted/30 border-b">
        <CardTitle className="tracking-widest uppercase text-amber-500 text-caption">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {lines.length === 0 ? (
          <div className="p-4 text-caption text-muted-foreground italic">
            {emptyMessage}
          </div>
        ) : (
          <Table>
            <TableHeader className="sr-only">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    const isRef = cell.column.id === "referenceNumber";
                    const isAmount = cell.column.id === "amount";
                    return (
                      <TableCell
                        key={cell.id}
                        className={`p-3 px-4 ${isRef ? "w-[15%]" : ""} ${
                          isAmount ? "w-[30%]" : ""
                        }`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
            <TableFooter className="bg-transparent border-t">
              <TableRow className="font-semibold text-ui hover:bg-transparent">
                <TableCell colSpan={2} className="p-4">
                  {totalLabel}
                </TableCell>
                <TableCell
                  className={`p-4 text-right font-mono ${totalColorClass}`}
                >
                  {formatNumber(totalAmount)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export default function StatementOfFinancialPositionPage() {
  const { data, isLoading, isError, error, refetch } =
    useGetApiV1ReportsStatementOfFinancialPositionQuery({});

  const noPeriod = (data as any)?.hasPeriodSelected === false;

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

  const equityLines = useMemo<FinancialPositionLine[]>(() => {
    return [
      ...equityExcludingRE,
      {
        referenceNumber: "",
        accountName: `Retained earnings, ${formatDateDisplay(asOfDate)}`,
        amount: retainedEarningsEnding,
      },
    ];
  }, [equityExcludingRE, retainedEarningsEnding, asOfDate]);

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
      <div className="py-16 text-center text-caption text-muted-foreground flex items-center justify-center gap-2">
        <Loader2 className="animate-spin" size={16} /> Loading Balance Sheet...
      </div>
    );
  }

  const errorMessage = isError
    ? (error as any)?.data?.message || "Gagal memuat laporan posisi keuangan."
    : null;

  return (
    <div className="space-y-6">
      {errorMessage && (
        <Alert variant="destructive" className="text-ui">
          <AlertTriangle size={16} />
          <AlertDescription className="text-caption">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      {noPeriod ? (
        <Card className="py-16 text-center border-dashed">
          <CardContent className="space-y-3">
            <EyeOff size={36} className="mx-auto text-muted-foreground" />
            <h3 className="font-semibold text-ui">No Period Selected</h3>
            <Button asChild size="sm">
              <Link href="/periods" className="gap-1.5 text-caption">
                <Calendar size={14} /> Go to Periods
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-h3 font-bold flex items-center gap-2">
                <Landmark className="text-sky-500" size={22} /> Statement of
                Financial Position
              </h1>
              <p className="text-ui text-muted-foreground mt-1">
                As of {formatDateDisplay(asOfDate) || "current period"} • IAS 1
                • IDR
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="text-caption"
              >
                Refresh Data
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="gap-1.5 text-caption"
              >
                <Link href="/reports/closing-journal">
                  <ArrowRight size={14} /> Closing Journal
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 items-start">
            {/* Assets Table */}
            <FinancialPositionSectionTable
              title="Assets"
              lines={assets}
              totalAmount={totalAssets}
              totalLabel="Total Assets"
              emptyMessage="No assets."
              totalColorClass="text-sky-500 font-bold"
            />

            {/* Liabilities & Equity */}
            <div className="space-y-4">
              <FinancialPositionSectionTable
                title="Liabilities"
                lines={liabilities}
                totalAmount={totalLiabilities}
                totalLabel="Total Liabilities"
                emptyMessage="No liabilities."
              />

              <FinancialPositionSectionTable
                title="Equity"
                lines={equityLines}
                totalAmount={totalEquity}
                totalLabel="Total Equity"
                emptyMessage="No equity accounts."
              />

              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4 flex items-center justify-between font-bold text-body">
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
                ? "bg-emerald-500/10 border-emerald-500/20 text-ui"
                : "bg-red-500/10 border-red-500/20 text-ui"
            }
          >
            {isBalanced ? (
              <CheckCircle2 size={16} className="text-emerald-500" />
            ) : (
              <AlertCircle size={16} className="text-red-500" />
            )}
            <AlertDescription className="text-caption">
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
