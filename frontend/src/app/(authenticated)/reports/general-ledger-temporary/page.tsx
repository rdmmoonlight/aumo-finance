"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
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
import { useGetApiV1ReportsGeneralLedgerTemporaryQuery } from "@/lib/generatedApi";
import {
  BookOpen,
  Calendar,
  EyeOff,
  AlertTriangle,
  Loader2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export interface TemporaryLedgerLine {
  journalEntryId?: number;
  entryDate: string;
  description?: string;
  debit: number;
  credit: number;
  runningBalance: number;
}

export interface TemporaryLedgerAccount {
  accountId: number;
  referenceNumber: number;
  accountName: string;
  type: string;
  endingBalance: number;
  lines: TemporaryLedgerLine[];
}

const formatNumber = (n: number) => {
  if (n === 0) return "-";
  const f = new Intl.NumberFormat("id-ID", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(Math.abs(n));
  return n < 0 ? `(${f})` : f;
};

const columnHelper = createColumnHelper<TemporaryLedgerLine>();

function TemporaryLedgerTable({ lines }: { lines: TemporaryLedgerLine[] }) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("entryDate", {
        header: () => <div className="text-caption">Date</div>,
        cell: (info) => (
          <span className="text-caption text-muted-foreground pl-6">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("description", {
        header: () => <div className="text-caption">Description</div>,
        cell: (info) => (
          <span className="text-caption text-muted-foreground">
            {info.getValue() || "-"}
          </span>
        ),
      }),
      columnHelper.accessor("debit", {
        header: () => <div className="text-right text-caption">Debit</div>,
        cell: (info) => {
          const val = info.getValue() || 0;
          return (
            <div className="text-right font-mono text-caption text-emerald-500">
              {val > 0 ? formatNumber(val) : "-"}
            </div>
          );
        },
      }),
      columnHelper.accessor("credit", {
        header: () => <div className="text-right text-caption">Credit</div>,
        cell: (info) => {
          const val = info.getValue() || 0;
          return (
            <div className="text-right font-mono text-caption text-red-500">
              {val > 0 ? formatNumber(val) : "-"}
            </div>
          );
        },
      }),
      columnHelper.accessor("runningBalance", {
        header: () => <div className="text-right pr-6 text-caption">Balance</div>,
        cell: (info) => (
          <div className="text-right pr-6 font-mono text-caption font-medium">
            {formatNumber(info.getValue() || 0)}
          </div>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: lines || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!lines || lines.length === 0) {
    return (
      <Table>
        <TableBody>
          <TableRow>
            <TableCell
              colSpan={5}
              className="text-center py-6 text-caption text-muted-foreground"
            >
              No postings
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="text-caption">
            {headerGroup.headers.map((header) => {
              const isDate = header.id === "entryDate";
              const isBalance = header.id === "runningBalance";

              return (
                <TableHead
                  key={header.id}
                  className={`
                    ${isDate ? "pl-6" : ""}
                    ${isBalance ? "pr-6" : ""}
                  `}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id} className="p-0 py-2">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function GeneralLedgerTemporaryPage() {
  const { data, isLoading, isError, error } =
    useGetApiV1ReportsGeneralLedgerTemporaryQuery();

  // Parsing data dari respon API RTK Query
  const responseData = data as any;
  const hasNoPeriod = responseData?.hasPeriodSelected === false;
  const ledgers: TemporaryLedgerAccount[] = responseData?.ledgers || [];
  const netIncome = responseData?.netIncomeBeforeClosing ?? 0;

  if (isLoading) {
    return (
      <div className="py-16 text-center text-caption text-muted-foreground flex items-center justify-center gap-2">
        <Loader2 className="animate-spin" size={16} /> Loading Temporary
        Ledger...
      </div>
    );
  }

  if (hasNoPeriod) {
    return (
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
    );
  }

  const errorMessage =
    isError && "data" in (error as any)
      ? (error as any).data?.message || "Failed to load temporary ledger data."
      : "Failed to load temporary ledger data.";

  return (
    <div className="space-y-6">
      {isError && (
        <Alert variant="destructive" className="text-ui">
          <AlertTriangle size={16} />
          <AlertDescription className="text-caption">{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h3 font-bold flex items-center gap-2">
            <BookOpen className="text-primary" size={22} /> Temporary Ledger
          </h1>
          <p className="text-ui text-muted-foreground mt-1">
            Revenue & Expense accounts • {ledgers.length} accounts • IDR
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="text-caption">
          <Link href="/reports/general-ledger/permanent">View Permanent</Link>
        </Button>
      </div>

      {/* Card Ringkasan Net Income Sebelum Penutupan */}
      <Card className="bg-muted/20">
        <CardContent className="py-4 flex items-center justify-between">
          <span className="text-ui font-medium text-muted-foreground">
            Net Income (Before Closing)
          </span>
          <div className="flex items-center gap-2 font-mono text-body font-bold">
            {netIncome >= 0 ? (
              <TrendingUp className="text-emerald-500" size={20} />
            ) : (
              <TrendingDown className="text-red-500" size={20} />
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
        {ledgers.map((ledger) => (
          <Card key={ledger.accountId} className="overflow-hidden">
            <CardHeader className="py-3 px-4 bg-muted/30 border-b flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="font-mono text-amber-500 text-label-small"
                >
                  {ledger.referenceNumber}
                </Badge>
                <span className="font-semibold text-ui">
                  {ledger.accountName}
                </span>
                <Badge variant="secondary" className="text-label-small">
                  {ledger.type}
                </Badge>
              </div>
              <span className="font-mono text-caption font-semibold text-emerald-500">
                Ending: {formatNumber(ledger.endingBalance)}
              </span>
            </CardHeader>
            <CardContent className="p-0">
              <TemporaryLedgerTable lines={ledger.lines} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
