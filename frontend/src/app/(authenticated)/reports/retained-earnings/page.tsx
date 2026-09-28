"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { useGetApiV1ReportsRetainedEarningsQuery } from "@/lib/generatedApi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  PiggyBank,
  Calendar,
  EyeOff,
  ArrowRight,
  AlertTriangle,
  Loader2,
} from "lucide-react";

export interface RetainedEarningsViewModel {
  accountName: string;
  startDate: string;
  endDate: string;
  beginningBalance: number;
  netIncome: number;
  dividends: number;
}

export interface StatementRow {
  id: string;
  label: string;
  amount: number;
  isIndent?: boolean;
  isTotal?: boolean;
  valueColorClass?: string;
  isNegativeFormat?: boolean;
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

const columnHelper = createColumnHelper<StatementRow>();

function RetainedEarningsTable({ data }: { data: StatementRow[] }) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("label", {
        header: "Keterangan",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <span
              className={`${
                item.isIndent ? "pl-8 text-muted-foreground text-caption" : ""
              } ${item.isTotal ? "font-bold text-body" : "font-medium text-ui"}`}
            >
              {item.label}
            </span>
          );
        },
      }),
      columnHelper.accessor("amount", {
        header: () => <div className="text-right pr-4 text-caption">Jumlah (IDR)</div>,
        cell: ({ row }) => {
          const item = row.original;
          const formatted = formatNumber(item.amount);

          return (
            <div
              className={`text-right pr-4 font-mono font-medium text-ui ${
                item.isTotal ? "text-emerald-500 font-bold text-body" : ""
              } ${item.valueColorClass || ""}`}
            >
              {item.isNegativeFormat ? `(${formatted})` : formatted}
            </div>
          );
        },
      }),
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  return (
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
        {table.getRowModel().rows.map((row) => {
          const isTotal = row.original.isTotal;
          return (
            <TableRow
              key={row.id}
              className={
                isTotal
                  ? "bg-primary/5 border-t-2 hover:bg-primary/5"
                  : "hover:bg-transparent"
              }
            >
              {row.getVisibleCells().map((cell) => {
                const isLabel = cell.column.id === "label";
                return (
                  <TableCell
                    key={cell.id}
                    className={`p-4 ${isLabel ? "w-[65%]" : "w-[35%]"}`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                );
              })}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default function RetainedEarningsPage() {
  const { data, isLoading, isError, error } =
    useGetApiV1ReportsRetainedEarningsQuery();

  const rawData = data as any;
  const noPeriod = rawData?.hasPeriodSelected === false;

  const vm: RetainedEarningsViewModel = useMemo(() => {
    return {
      accountName: rawData?.accountName || "Retained Earnings",
      startDate: rawData?.startDate || "",
      endDate: rawData?.endDate || "",
      beginningBalance:
        Number(
          rawData?.beginningRetainedEarnings ?? rawData?.beginningBalance,
        ) || 0,
      netIncome: Number(rawData?.netIncome) || 0,
      dividends: Number(rawData?.dividendsOrDraws ?? rawData?.dividends) || 0,
    };
  }, [rawData]);

  const endingBalance = useMemo(
    () => vm.beginningBalance + vm.netIncome - vm.dividends,
    [vm],
  );

  const statementRows = useMemo<StatementRow[]>(() => {
    const rows: StatementRow[] = [
      {
        id: "beginning",
        label: `Retained earnings, ${
          formatDateDisplay(vm.startDate) || "start"
        }`,
        amount: vm.beginningBalance,
      },
      {
        id: "netIncome",
        label: "Add: Net Income",
        amount: vm.netIncome,
        isIndent: true,
        valueColorClass:
          vm.netIncome >= 0 ? "text-emerald-500" : "text-red-500",
      },
    ];

    if (vm.dividends !== 0) {
      rows.push({
        id: "dividends",
        label: "Less: Dividends / Withdrawals",
        amount: vm.dividends,
        isIndent: true,
        isNegativeFormat: true,
        valueColorClass: "text-red-500",
      });
    }

    rows.push({
      id: "ending",
      label: `Retained earnings, ${formatDateDisplay(vm.endDate) || "end"}`,
      amount: endingBalance,
      isTotal: true,
    });

    return rows;
  }, [vm, endingBalance]);

  const errorMessage = useMemo(() => {
    if (!isError || !error) return null;
    if ("data" in error) {
      return (error.data as any)?.message || "Gagal memuat laporan.";
    }
    return "Terjadi kesalahan jaringan.";
  }, [isError, error]);

  if (isLoading)
    return (
      <div className="py-16 text-center text-caption text-muted-foreground flex items-center justify-center gap-2">
        <Loader2 className="animate-spin" size={16} /> Loading Retained
        Earnings...
      </div>
    );

  return (
    <div className="space-y-6">
      {errorMessage && (
        <Alert variant="destructive" className="text-ui">
          <AlertTriangle size={16} />
          <AlertDescription className="text-caption">{errorMessage}</AlertDescription>
        </Alert>
      )}

      {noPeriod ? (
        <Card className="py-16 text-center border-dashed">
          <CardContent className="space-y-3">
            <EyeOff size={36} className="mx-auto text-muted-foreground" />
            <h3 className="font-semibold text-ui">No Period Selected</h3>
            <p className="text-ui text-muted-foreground">
              This report follows whichever period you're viewing.
            </p>
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
                <PiggyBank className="text-emerald-500" size={22} /> Retained
                Earnings Statement
              </h1>
              <p className="text-ui text-muted-foreground mt-1">
                Bridges Income Statement to Equity on Balance Sheet • IDR
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="gap-1.5 text-caption">
              <Link href="/reports/statement-of-financial-position">
                <ArrowRight size={14} /> Balance Sheet
              </Link>
            </Button>
          </div>

          <Card className="max-w-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-body">{vm.accountName}</CardTitle>
              <CardDescription className="text-caption">
                {formatDateDisplay(vm.startDate)} →{" "}
                {formatDateDisplay(vm.endDate)}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <RetainedEarningsTable data={statementRows} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
