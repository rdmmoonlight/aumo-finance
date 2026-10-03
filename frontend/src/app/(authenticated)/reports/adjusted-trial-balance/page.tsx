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
import { useGetApiV1ReportsWorksheetQuery } from "@/lib/store/(authenticated)/reports/reportsApi";
import {
  ListChecks,
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
            <div className="font-mono text-caption text-emerald-500 text-right">
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
            <div className="font-mono text-caption text-red-500 text-right">
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
    getRowId: (row) => String(row.accountId),
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
                        ${isRef ? "w-[10%] pl-6" : ""}
                        ${isAccount ? "w-[50%]" : ""}
                        ${isType ? "w-[15%]" : ""}
                        ${isDebit ? "w-[12%]" : ""}
                        ${isCredit ? "w-[13%] pr-6" : ""}
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
                          ${isRef ? "pl-6" : ""}
                          ${isCredit ? "pr-6" : ""}
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
                  className="py-8 text-center text-caption text-muted-foreground"
                >
                  No accounts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow className="font-bold text-caption">
              <TableCell colSpan={3} className="pl-6 text-right">
                Total
              </TableCell>
              <TableCell className="font-mono text-emerald-500 text-right">
                {formatNumber(totalDebit)}
              </TableCell>
              <TableCell className="pr-6 font-mono text-red-500 text-right">
                {formatNumber(totalCredit)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function AdjustedTrialBalancePage() {
  const { data, isLoading, isError, error } =
    useGetApiV1ReportsWorksheetQuery();

  const noPeriod =
    (data as any)?.hasPeriodSelected === false ||
    (error as any)?.status === 404;

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

  const errorMessage =
    (error as any)?.data?.message ||
    "Gagal memuat data adjusted trial balance.";

  if (isLoading)
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-center text-caption text-muted-foreground">
        <Loader2 className="animate-spin" size={16} /> Loading adjusted trial
        balance...
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-h3 font-bold">
          <ListChecks className="text-amber-500" size={22} /> Adjusted Trial
          Balance
        </h1>
        <p className="mt-1 text-ui text-muted-foreground">
          After adjusting entries • IDR
        </p>
      </div>

      {isError && !noPeriod && (
        <Alert variant="destructive" className="text-ui">
          <AlertTriangle size={16} />
          <AlertDescription className="text-caption">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      {noPeriod ? (
        <Card className="border-dashed py-16 text-center">
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
                ? "border-emerald-500/20 bg-emerald-500/10 text-ui"
                : "border-red-500/20 bg-red-500/10 text-ui"
            }
          >
            <CheckCircle2 size={16} />
            <AlertDescription className="text-caption">
              {isBalanced
                ? "Adjusted TB is balanced"
                : "Unbalanced - check adjusting entries"}
            </AlertDescription>
          </Alert>
        </>
      )}
    </div>
  );
}
