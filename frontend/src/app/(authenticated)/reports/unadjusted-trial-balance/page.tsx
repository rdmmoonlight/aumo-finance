"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { useGetApiV1ReportsJournalsGeneralQuery } from "@/lib/store/(authenticated)/reports/reportsApi";
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
  List,
  Calendar,
  EyeOff,
  AlertTriangle,
  Loader2,
  CheckCircle2,
} from "lucide-react";

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

const columnHelper = createColumnHelper<TrialRow>();

function TrialTable({
  rows,
  totalDebit,
  totalCredit,
}: {
  rows: TrialRow[];
  totalDebit: number;
  totalCredit: number;
}) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("referenceNumber", {
        header: () => <div className="text-center text-caption">Ref.</div>,
        cell: (info) => (
          <div className="text-center">
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
          <span className="text-caption font-medium">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("type", {
        header: "Type",
        cell: (info) => (
          <Badge variant="secondary" className="text-label-small">
            {info.getValue()}
          </Badge>
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
        header: () => (
          <div className="text-right pr-6 text-caption">Credit</div>
        ),
        cell: (info) => {
          const val = info.getValue() || 0;
          return (
            <div className="text-right pr-6 font-mono text-caption text-red-500">
              {val > 0 ? formatNumber(val) : "-"}
            </div>
          );
        },
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row, idx) => String(row.accountId || idx),
  });

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isRef = header.id === "referenceNumber";
                  const isAccount = header.id === "accountName";
                  const isType = header.id === "type";
                  const isDebit = header.id === "debit";
                  const isCredit = header.id === "credit";

                  return (
                    <TableHead
                      key={header.id}
                      className={`text-caption
                        ${isRef ? "text-center pl-6 w-[10%]" : ""}
                        ${isAccount ? "w-[50%]" : ""}
                        ${isType ? "w-[15%]" : ""}
                        ${isDebit ? "text-right w-[12%]" : ""}
                        ${isCredit ? "text-right pr-6 w-[13%]" : ""}
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
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    const isRef = cell.column.id === "referenceNumber";
                    const isCredit = cell.column.id === "credit";

                    return (
                      <TableCell
                        key={cell.id}
                        className={`
                          ${isRef ? "text-center pl-6" : ""}
                          ${isCredit ? "text-right pr-6" : ""}
                        `}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground text-caption"
                >
                  No accounts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow className="font-bold text-caption">
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

export default function UnadjustedTrialBalancePage() {
  // Panggil RTK Query auto-generated hook
  const { data, isLoading, isError, error } =
    useGetApiV1ReportsJournalsGeneralQuery();

  // Evaluasi jika belum ada periode dipilih (Response 404 / Object status khusus)
  const noPeriod = useMemo(() => {
    if (!data) return false;
    if ((data as any)?.hasPeriodSelected === false) return true;
    if (isError && (error as any)?.status === 404) return true;
    return false;
  }, [data, isError, error]);

  // Kalkulasi & Normalisasi Debit / Credit Baris
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

  // Total Debit & Credit
  const totalDebit = useMemo(
    () => rows.reduce((s, r) => s + (Number(r.debit) || 0), 0),
    [rows],
  );

  const totalCredit = useMemo(
    () => rows.reduce((s, r) => s + (Number(r.credit) || 0), 0),
    [rows],
  );

  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  // Render State Loading
  if (isLoading) {
    return (
      <div className="py-16 text-center text-caption text-muted-foreground flex items-center justify-center gap-2">
        <Loader2 className="animate-spin" size={16} /> Loading unadjusted trial
        balance...
      </div>
    );
  }

  // Menentukan Pesan Error
  const errorMessage =
    isError && !noPeriod
      ? (error as any)?.data?.message || "Gagal memuat laporan trial balance."
      : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h3 font-bold flex items-center gap-2">
            <List className="text-sky-500" size={22} /> Unadjusted Trial Balance
          </h1>
          <p className="text-ui text-muted-foreground mt-1">
            Before adjustments • IDR
          </p>
        </div>
      </div>

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
              Select a period to view trial balance.
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
          <TrialTable
            rows={rows}
            totalDebit={totalDebit}
            totalCredit={totalCredit}
          />
          <Alert
            className={
              isBalanced
                ? "bg-emerald-500/10 border-emerald-500/20 text-ui"
                : "bg-red-500/10 border-red-500/20 text-ui"
            }
          >
            <CheckCircle2 size={16} />
            <AlertDescription className="text-caption">
              {isBalanced
                ? "Balanced: Debit = Credit"
                : "Unbalanced - check journal entries"}
            </AlertDescription>
          </Alert>
        </>
      )}
    </div>
  );
}
