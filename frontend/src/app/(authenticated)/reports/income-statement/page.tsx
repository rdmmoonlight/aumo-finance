"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
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
import { useGetApiV1ReportsIncomeStatementQuery } from "@/lib/store/(authenticated)/reports/reportsApi";
import {
  TrendingUp,
  Calendar,
  EyeOff,
  ArrowRight,
  AlertTriangle,
  Loader2,
} from "lucide-react";

export interface IncomeStatementLine {
  referenceNumber: number;
  accountName: string;
  amount: number;
  isExpense?: boolean;
}

const formatNumber = (n: number) => {
  const f = new Intl.NumberFormat("id-ID", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(Math.abs(n));
  return n < 0 ? `(${f})` : f;
};

const columnHelper = createColumnHelper<IncomeStatementLine>();

function IncomeStatementSectionTable({
  title,
  lines,
  totalAmount,
  totalLabel,
  emptyMessage,
}: {
  title: string;
  lines: IncomeStatementLine[];
  totalAmount: number;
  totalLabel: string;
  emptyMessage: string;
}) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("referenceNumber", {
        header: () => <div className="text-left pl-4 text-caption">Ref #</div>,
        cell: (info) => (
          <div className="pl-4">
            <Badge
              variant="outline"
              className="font-mono text-amber-500 text-label-small"
            >
              {info.getValue() || "-"}
            </Badge>
          </div>
        ),
      }),
      columnHelper.accessor("accountName", {
        header: "Account",
        cell: (info) => (
          <span className="text-ui font-medium">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("amount", {
        header: () => (
          <div className="text-right pr-4 text-caption">Amount</div>
        ),
        cell: ({ row }) => {
          const val = row.original.amount;
          const formatted = formatNumber(val);
          return (
            <div className="text-right pr-4 font-mono text-caption">
              {row.original.isExpense ? `(${formatted})` : formatted}
            </div>
          );
        },
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
    <div className="p-4 space-y-2">
      <div className="font-bold tracking-widest text-amber-500 uppercase text-caption">
        {title}
      </div>

      {lines.length === 0 ? (
        <div className="text-caption text-muted-foreground italic pl-4 py-2">
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
              <TableRow
                key={row.id}
                className="border-none hover:bg-transparent"
              >
                {row.getVisibleCells().map((cell) => {
                  const isRef = cell.column.id === "referenceNumber";
                  const isAmount = cell.column.id === "amount";
                  return (
                    <TableCell
                      key={cell.id}
                      className={`py-1 ${isRef ? "w-[15%]" : ""} ${
                        isAmount ? "w-[25%]" : ""
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
              <TableCell colSpan={2} className="pl-4 py-2">
                {totalLabel}
              </TableCell>
              <TableCell className="text-right pr-4 py-2 font-mono text-ui">
                {formatNumber(totalAmount)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      )}
    </div>
  );
}

export default function IncomeStatementPage() {
  const { data, isLoading, isError, error } =
    useGetApiV1ReportsIncomeStatementQuery();

  const rawData = data as any;
  const noPeriod = rawData?.hasPeriodSelected === false;

  const vm = useMemo(() => {
    return {
      asOfDate: rawData?.asOfDate || "",
      revenues: (rawData?.revenueAccounts ||
        rawData?.revenues ||
        []) as IncomeStatementLine[],
      operatingExpenses: (
        (rawData?.expenseAccounts ||
          rawData?.operatingExpenses ||
          []) as IncomeStatementLine[]
      ).map((e) => ({ ...e, isExpense: true })),
      otherIncome: (rawData?.otherIncomeAccounts ||
        rawData?.otherIncome ||
        []) as IncomeStatementLine[],
      otherExpenses: (
        (rawData?.otherExpenseAccounts ||
          rawData?.otherExpenses ||
          []) as IncomeStatementLine[]
      ).map((e) => ({ ...e, isExpense: true })),
    };
  }, [rawData]);

  const totalRevenue = useMemo(
    () => vm.revenues.reduce((s, i) => s + (Number(i.amount) || 0), 0),
    [vm.revenues],
  );
  const totalOpex = useMemo(
    () => vm.operatingExpenses.reduce((s, i) => s + (Number(i.amount) || 0), 0),
    [vm.operatingExpenses],
  );
  const operatingIncome = totalRevenue - totalOpex;
  const totalOtherIncome = useMemo(
    () => vm.otherIncome.reduce((s, i) => s + (Number(i.amount) || 0), 0),
    [vm.otherIncome],
  );
  const totalOtherExpenses = useMemo(
    () => vm.otherExpenses.reduce((s, i) => s + (Number(i.amount) || 0), 0),
    [vm.otherExpenses],
  );
  const netIncome = operatingIncome + totalOtherIncome - totalOtherExpenses;

  if (isLoading) {
    return (
      <div className="py-16 text-center text-caption text-muted-foreground flex items-center justify-center gap-2">
        <Loader2 className="animate-spin" size={16} /> Loading Income
        Statement...
      </div>
    );
  }

  const errorMessage = isError
    ? (error as any)?.data?.message ||
      (error as any)?.message ||
      "Gagal mengambil data Laporan Laba Rugi."
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
                <TrendingUp className="text-emerald-500" size={22} /> Income
                Statement
              </h1>
              <p className="text-ui text-muted-foreground mt-1">
                Profit or Loss (IAS 1) for{" "}
                {vm.asOfDate
                  ? new Date(vm.asOfDate).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "current period"}{" "}
                • IDR
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-1.5 text-caption"
            >
              <Link href="/reports/retained-earnings">
                <ArrowRight size={14} /> Retained Earnings
              </Link>
            </Button>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y">
                {/* Revenue Section Table */}
                <IncomeStatementSectionTable
                  title="Revenue"
                  lines={vm.revenues}
                  totalAmount={totalRevenue}
                  totalLabel="Total Revenue"
                  emptyMessage="No revenue accounts recorded."
                />

                {/* Operating Expenses Section Table */}
                <IncomeStatementSectionTable
                  title="Operating Expenses"
                  lines={vm.operatingExpenses}
                  totalAmount={totalOpex}
                  totalLabel="Total Operating Expenses"
                  emptyMessage="No operating expenses."
                />

                {/* Operating Income Summary */}
                <div className="flex items-center justify-between p-4 bg-muted/30 font-bold text-ui">
                  <span>Operating Income</span>
                  <span
                    className={`font-mono text-body ${
                      operatingIncome >= 0 ? "text-emerald-500" : "text-red-500"
                    }`}
                  >
                    {formatNumber(operatingIncome)}
                  </span>
                </div>

                {/* Other Income / Expenses Section Table */}
                {(vm.otherIncome.length > 0 || vm.otherExpenses.length > 0) && (
                  <IncomeStatementSectionTable
                    title="Other Income & Expenses"
                    lines={[...vm.otherIncome, ...vm.otherExpenses]}
                    totalAmount={totalOtherIncome - totalOtherExpenses}
                    totalLabel="Total Other Income / (Expenses)"
                    emptyMessage="No other income or expenses recorded."
                  />
                )}

                {/* Net Income Final Summary */}
                <div className="flex items-center justify-between p-4 bg-primary/5 border-t-2 border-primary/20">
                  <span className="font-bold text-body">Net Income</span>
                  <span
                    className={`font-mono font-bold text-h4 ${
                      netIncome >= 0 ? "text-emerald-500" : "text-red-500"
                    }`}
                  >
                    {formatNumber(netIncome)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
