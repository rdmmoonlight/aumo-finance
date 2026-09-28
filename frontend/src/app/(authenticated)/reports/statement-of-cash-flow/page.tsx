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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGetApiV1ReportsStatementOfCashFlowQuery } from "@/lib/generatedApi";
import {
  Banknote,
  Calendar,
  EyeOff,
  ArrowRight,
  AlertTriangle,
  Loader2,
  Info,
} from "lucide-react";

export interface CashFlowLine {
  description: string;
  amount: number;
}

const formatNumber = (n: number) => {
  const f = new Intl.NumberFormat("id-ID", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(Math.abs(n));
  return n < 0 ? `(${f})` : f;
};

const columnHelper = createColumnHelper<CashFlowLine>();

function CashFlowSectionTable({
  title,
  lines,
  totalLabel,
  total,
}: {
  title: string;
  lines: CashFlowLine[];
  totalLabel: string;
  total: number;
}) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("description", {
        header: "Deskripsi Aktivitas",
        cell: (info) => (
          <span className="text-ui font-medium pl-4">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("amount", {
        header: () => <div className="text-right pr-4 text-caption">Jumlah</div>,
        cell: (info) => {
          const val = info.getValue() || 0;
          return (
            <div
              className={`text-right pr-4 font-mono text-caption ${
                val < 0 ? "text-red-500" : "text-emerald-500"
              }`}
            >
              {formatNumber(val)}
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
    <div className="space-y-2">
      <div className="text-caption font-bold tracking-widest text-amber-500 uppercase">
        {title}
      </div>

      {lines.length === 0 ? (
        <div className="text-caption text-muted-foreground italic pl-4 py-2">
          No {title.toLowerCase()}.
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
                  const isDesc = cell.column.id === "description";
                  return (
                    <TableCell
                      key={cell.id}
                      className={`py-1 ${isDesc ? "w-[75%]" : "w-[25%]"}`}
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
              <TableCell className="pl-4 py-2">{totalLabel}</TableCell>
              <TableCell
                className={`text-right pr-4 py-2 font-mono ${
                  total < 0 ? "text-red-500" : "text-emerald-500"
                }`}
              >
                {formatNumber(total)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      )}
    </div>
  );
}

export default function StatementOfCashFlowPage() {
  const { data, isLoading, isError, error } =
    useGetApiV1ReportsStatementOfCashFlowQuery();

  const responseData = data as any;
  const noPeriod = responseData?.hasPeriodSelected === false;

  const operatingActivities: CashFlowLine[] = useMemo(
    () => responseData?.operatingActivities || [],
    [responseData],
  );
  const investingActivities: CashFlowLine[] = useMemo(
    () => responseData?.investingActivities || [],
    [responseData],
  );
  const financingActivities: CashFlowLine[] = useMemo(
    () => responseData?.financingActivities || [],
    [responseData],
  );
  const beginningCash = useMemo(
    () => Number(responseData?.beginningCash) || 0,
    [responseData],
  );

  const netOperating = useMemo(
    () => operatingActivities.reduce((s, i) => s + (Number(i.amount) || 0), 0),
    [operatingActivities],
  );
  const netInvesting = useMemo(
    () => investingActivities.reduce((s, i) => s + (Number(i.amount) || 0), 0),
    [investingActivities],
  );
  const netFinancing = useMemo(
    () => financingActivities.reduce((s, i) => s + (Number(i.amount) || 0), 0),
    [financingActivities],
  );

  const netChange = netOperating + netInvesting + netFinancing;
  const endingCash = beginningCash + netChange;

  const errorMessage = useMemo(() => {
    if (!isError || !error) return null;

    if ("status" in error) {
      if ("data" in error && error.data) {
        return (error.data as any)?.message || "Gagal memuat Laporan Arus Kas.";
      }
      if ("error" in error) {
        return error.error;
      }
    } else if ("message" in error) {
      return error.message || "Terjadi kesalahan jaringan.";
    }

    return "Terjadi kesalahan yang tidak diketahui.";
  }, [isError, error]);

  if (isLoading) {
    return (
      <div className="py-16 text-center text-caption text-muted-foreground flex items-center justify-center gap-2">
        <Loader2 className="animate-spin" size={16} /> Loading Cash Flow...
      </div>
    );
  }

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
                <Banknote className="text-emerald-500" size={22} /> Cash Flow
                Statement
              </h1>
              <p className="text-ui text-muted-foreground mt-1">
                Indirect method (IAS 7) • IDR
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="gap-1.5 text-caption">
              <Link href="/reports/income-statement">
                <ArrowRight size={14} /> Income Statement
              </Link>
            </Button>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="p-4 space-y-6 divide-y">
              <CashFlowSectionTable
                title="Cash Flows from Operating Activities"
                lines={operatingActivities}
                totalLabel="Net Cash from Operating"
                total={netOperating}
              />
              <div className="pt-6">
                <CashFlowSectionTable
                  title="Cash Flows from Investing Activities"
                  lines={investingActivities}
                  totalLabel="Net Cash from Investing"
                  total={netInvesting}
                />
              </div>
              <div className="pt-6">
                <CashFlowSectionTable
                  title="Cash Flows from Financing Activities"
                  lines={financingActivities}
                  totalLabel="Net Cash from Financing"
                  total={netFinancing}
                />
              </div>

              <div className="pt-6 space-y-2">
                <div className="flex items-center justify-between font-bold text-body px-4">
                  <span>Net Increase (Decrease) in Cash</span>
                  <span
                    className={`font-mono ${
                      netChange < 0 ? "text-red-500" : "text-emerald-500"
                    }`}
                  >
                    {formatNumber(netChange)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-ui text-muted-foreground px-4">
                  <span>Cash, Beginning of Period</span>
                  <span className="font-mono">
                    {formatNumber(beginningCash)}
                  </span>
                </div>
                <div className="flex items-center justify-between font-bold text-body pt-2 border-t px-4">
                  <span className="text-sky-500">Cash, End of Period</span>
                  <span className="font-mono text-sky-500">
                    {formatNumber(endingCash)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert className="bg-sky-500/10 border-sky-500/20 text-ui">
            <Info size={16} />
            <AlertDescription className="text-caption">
              Prepared using Indirect Method per IAS 7.
            </AlertDescription>
          </Alert>
        </>
      )}
    </div>
  );
}
