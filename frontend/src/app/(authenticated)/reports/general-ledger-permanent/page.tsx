"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { useGetApiV1ReportsGeneralLedgerPermanentQuery } from "@/lib/generatedApi";
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
  BookOpen,
  Calendar,
  EyeOff,
  AlertTriangle,
  Loader2,
} from "lucide-react";

export interface LedgerLineViewModel {
  journalEntryId: number;
  entryDate: string;
  description?: string;
  debit: number;
  credit: number;
  runningBalance: number;
}

export interface LedgerAccountViewModel {
  accountId: number;
  referenceNumber: number;
  accountName: string;
  type: string;
  normalBalanceIsDebit: boolean;
  endingBalance: number;
  lines: LedgerLineViewModel[];
}

const formatNumber = (n: number) => {
  if (n === 0) return "-";
  const f = new Intl.NumberFormat("id-ID", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(Math.abs(n));
  return n < 0 ? `(${f})` : f;
};

const columnHelper = createColumnHelper<LedgerLineViewModel>();

function LedgerTable({ lines }: { lines: LedgerLineViewModel[] }) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("entryDate", {
        header: () => (
          /* Label kecil (11px) */
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Date
          </span>
        ),
        cell: (info) => (
          /* Caption (12px) */
          <span className="text-xs text-muted-foreground">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("description", {
        header: () => (
          /* Label kecil (11px) */
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Description
          </span>
        ),
        cell: (info) => (
          /* Caption (12px) */
          <span className="text-xs text-muted-foreground">
            {info.getValue() || "-"}
          </span>
        ),
      }),
      columnHelper.accessor("debit", {
        header: () => (
          /* Label kecil (11px) */
          <div className="text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Debit
          </div>
        ),
        cell: (info) => {
          const val = info.getValue();
          return (
            /* Caption (12px) */
            <span className="font-mono text-xs text-emerald-500">
              {val > 0 ? formatNumber(val) : "-"}
            </span>
          );
        },
      }),
      columnHelper.accessor("credit", {
        header: () => (
          /* Label kecil (11px) */
          <div className="text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Credit
          </div>
        ),
        cell: (info) => {
          const val = info.getValue();
          return (
            /* Caption (12px) */
            <span className="font-mono text-xs text-red-500">
              {val > 0 ? formatNumber(val) : "-"}
            </span>
          );
        },
      }),
      columnHelper.accessor("runningBalance", {
        header: () => (
          /* Label kecil (11px) */
          <div className="text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Balance
          </div>
        ),
        cell: (info) => (
          /* Caption (12px) */
          <span className="font-mono text-xs font-medium">
            {formatNumber(info.getValue())}
          </span>
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
            {/* Caption (12px) */}
            <TableCell
              colSpan={5}
              className="text-center py-6 text-xs text-muted-foreground"
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
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const isRightAligned = [
                "debit",
                "credit",
                "runningBalance",
              ].includes(header.id);
              const isFirstCell = header.id === "entryDate";
              const isLastCell = header.id === "runningBalance";

              return (
                <TableHead
                  key={header.id}
                  className={`
                    ${isRightAligned ? "text-right" : ""}
                    ${isFirstCell ? "pl-6" : ""}
                    ${isLastCell ? "pr-6" : ""}
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
            {row.getVisibleCells().map((cell) => {
              const isRightAligned = [
                "debit",
                "credit",
                "runningBalance",
              ].includes(cell.column.id);
              const isFirstCell = cell.column.id === "entryDate";
              const isLastCell = cell.column.id === "runningBalance";

              return (
                <TableCell
                  key={cell.id}
                  className={`
                    ${isRightAligned ? "text-right" : ""}
                    ${isFirstCell ? "pl-6" : ""}
                    ${isLastCell ? "pr-6" : ""}
                  `}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function GeneralLedgerPermanentPage() {
  const { data, isLoading, isError, error } =
    useGetApiV1ReportsGeneralLedgerPermanentQuery();

  const rawData = data as any;
  const noPeriod = rawData?.hasPeriodSelected === false;
  const ledgers: LedgerAccountViewModel[] =
    rawData?.ledgers || (Array.isArray(rawData) ? rawData : []);

  if (isLoading) {
    return (
      /* Caption (12px) */
      <div className="py-16 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
        <Loader2 className="animate-spin" size={16} /> Loading Permanent
        Ledger...
      </div>
    );
  }

  if (noPeriod) {
    return (
      <Card className="py-16 text-center border-dashed">
        <CardContent className="space-y-3">
          <EyeOff size={36} className="mx-auto text-muted-foreground" />
          {/* UI (14px) */}
          <h3 className="text-sm font-semibold">No Period Selected</h3>
          {/* UI (14px) */}
          <Button asChild size="sm" className="text-sm">
            <Link href="/periods" className="gap-1.5">
              <Calendar size={14} /> Go to Periods
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const errorMessage =
    isError && error
      ? (error as any)?.data?.message || "Failed to load general ledger data."
      : null;

  return (
    <div className="space-y-6">
      {errorMessage && (
        <Alert variant="destructive">
          <AlertTriangle size={16} />
          {/* Caption (12px) */}
          <AlertDescription className="text-xs">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {/* H3 (20px) */}
          <h1 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="text-primary" size={22} /> Permanent Ledger
          </h1>
          {/* UI (14px) */}
          <p className="text-sm text-muted-foreground mt-1">
            Assets, Liabilities, Equity • {ledgers.length} accounts • IDR
          </p>
        </div>
        {/* UI (14px) */}
        <Button asChild variant="outline" size="sm" className="text-sm">
          <Link href="/reports/general-ledger/temporary">View Temporary</Link>
        </Button>
      </div>

      <div className="space-y-4">
        {ledgers.map((ledger) => (
          <Card key={ledger.accountId} className="overflow-hidden">
            <CardHeader className="py-3 px-4 bg-muted/30 border-b flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                {/* Caption (12px) */}
                <Badge
                  variant="outline"
                  className="font-mono text-amber-500 text-xs"
                >
                  {ledger.referenceNumber}
                </Badge>
                {/* UI (14px) */}
                <span className="font-semibold text-sm">
                  {ledger.accountName}
                </span>
                {/* Caption (12px) */}
                <Badge variant="secondary" className="text-xs">
                  {ledger.type}
                </Badge>
              </div>
              {/* Caption (12px) */}
              <span className="font-mono text-xs font-semibold text-emerald-500">
                Ending: {formatNumber(ledger.endingBalance)}
              </span>
            </CardHeader>
            <CardContent className="p-0">
              <LedgerTable lines={ledger.lines} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
