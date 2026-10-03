"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
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
import { useGetApiV1ReportsJournalsClosingQuery } from "@/lib/store/(authenticated)/reports/reportsApi";

import {
  Lock,
  ArrowRight,
  EyeOff,
  Info,
  AlertTriangle,
  Loader2,
} from "lucide-react";

export interface ClosingJournalLine {
  referenceNumber?: number;
  accountName: string;
  debit: number;
  credit: number;
}

export interface ClosingJournalEntryGroup {
  description: string;
  lines: ClosingJournalLine[];
}

export interface ClosingJournalViewModel {
  netIncome: number;
  retainedEarningsAccountName: string;
  groups: ClosingJournalEntryGroup[];
}

const formatNumber = (amount: number) => {
  const formatted = new Intl.NumberFormat("id-ID", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
  return amount < 0 ? `(${formatted})` : formatted;
};

const columnHelper = createColumnHelper<ClosingJournalLine>();

function ClosingGroupTable({
  group,
  totals,
}: {
  group: ClosingJournalEntryGroup;
  totals: { totalDebit: number; totalCredit: number };
}) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("referenceNumber", {
        header: () => <div className="text-center text-caption">Ref.</div>,
        cell: (info) => {
          const val = info.getValue();
          return (
            <div className="text-center pl-6">
              <Badge
                variant="outline"
                className="font-mono text-amber-500 text-label-small"
              >
                {val && val > 0 ? val : "-"}
              </Badge>
            </div>
          );
        },
      }),
      columnHelper.accessor("accountName", {
        header: "Account",
        cell: ({ row }) => {
          const isCredit = row.original.credit > 0;
          return (
            <div
              className={`text-caption ${
                isCredit ? "pl-6 text-muted-foreground" : "font-medium"
              }`}
            >
              {row.original.accountName}
            </div>
          );
        },
      }),
      columnHelper.accessor("debit", {
        header: () => <div className="text-right text-caption">Debit</div>,
        cell: (info) => {
          const val = info.getValue();
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
          const val = info.getValue();
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
    data: group.lines || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="py-3 bg-muted/30 border-b">
        <CardTitle className="text-ui">{group.description}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto w-full">
          <Table className="min-w-[600px]">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const isRef = header.id === "referenceNumber";
                    const isAcc = header.id === "accountName";
                    const isDebit = header.id === "debit";
                    const isCredit = header.id === "credit";

                    return (
                      <TableHead
                        key={header.id}
                        className={`text-caption
                          ${isRef ? "text-center pl-6 w-[15%]" : ""}
                          ${isAcc ? "w-[45%]" : ""}
                          ${isDebit ? "text-right w-[20%]" : ""}
                          ${isCredit ? "text-right pr-6 w-[20%]" : ""}
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
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow className="font-bold text-caption">
                <TableCell colSpan={2} className="text-right pl-6">
                  Total
                </TableCell>
                <TableCell className="text-right font-mono text-emerald-500">
                  {formatNumber(totals?.totalDebit || 0)}
                </TableCell>
                <TableCell className="text-right pr-6 font-mono text-red-500">
                  {formatNumber(totals?.totalCredit || 0)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ClosingJournalReportPage() {
  // 1. Konsumsi RTK Query Hook
  const {
    data: rawResponse,
    isLoading,
    isError,
    error,
  } = useGetApiV1ReportsJournalsClosingQuery();

  // 2. Ekstrak & Normalisasi Response Data
  const { noPeriodSelected, vm } = useMemo(() => {
    const data = rawResponse as any;

    if (!data || data?.hasPeriodSelected === false) {
      return {
        noPeriodSelected: true,
        vm: {
          netIncome: 0,
          retainedEarningsAccountName: "Retained Earnings",
          groups: [],
        } as ClosingJournalViewModel,
      };
    }

    const cjData = data?.closingJournal || data;
    const rawGroups = Array.isArray(cjData?.groups) ? cjData.groups : [];
    const safeGroups: ClosingJournalEntryGroup[] = rawGroups.map((g: any) => ({
      description: g.description || "Closing Entry",
      lines: Array.isArray(g.lines)
        ? g.lines.map((l: any) => ({
            referenceNumber: Number(l.referenceNumber) || undefined,
            accountName: l.accountName || "-",
            debit: Number(l.debit) || 0,
            credit: Number(l.credit) || 0,
          }))
        : [],
    }));

    return {
      noPeriodSelected: false,
      vm: {
        netIncome: Number(cjData?.netIncome) || 0,
        retainedEarningsAccountName:
          cjData?.retainedEarningsAccountName || "Retained Earnings",
        groups: safeGroups,
      } as ClosingJournalViewModel,
    };
  }, [rawResponse]);

  // 3. Hitung Totals per Group
  const groupTotals = useMemo(
    () =>
      vm.groups.map((g) => {
        const lines = g.lines || [];
        const totalDebit = lines.reduce((s, l) => s + (l.debit || 0), 0);
        const totalCredit = lines.reduce((s, l) => s + (l.credit || 0), 0);
        return { totalDebit, totalCredit };
      }),
    [vm.groups],
  );

  // Error Message Handler
  const errorMessage = useMemo(() => {
    if (!isError) return null;
    const err = error as any;
    return (
      err?.data?.message || err?.message || "Failed to load closing journal"
    );
  }, [isError, error]);

  if (isLoading) {
    return (
      <div className="py-16 text-center text-caption text-muted-foreground flex items-center justify-center gap-2">
        <Loader2 className="animate-spin" size={16} /> Loading closing
        entries...
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {errorMessage && (
        <Alert variant="destructive" className="text-ui">
          <AlertTriangle size={16} />
          <AlertDescription className="text-caption">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      {noPeriodSelected ? (
        <Card className="py-16 text-center border-dashed">
          <CardContent className="space-y-3">
            <EyeOff size={36} className="mx-auto text-muted-foreground" />
            <h3 className="font-semibold text-ui">No Period Selected</h3>
            <p className="text-ui text-muted-foreground">
              This report follows whichever period you're viewing.
            </p>
            <Button asChild size="sm">
              <Link href="/periods" className="gap-1.5 text-caption">
                <EyeOff size={14} /> Go to Periods
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-h3 font-bold flex items-center gap-2">
                <Lock className="text-amber-500" size={22} /> Closing Journal
              </h1>
              <p className="text-ui text-muted-foreground mt-1 max-w-3xl">
                Closing entries are calculated automatically based on current
                nominal account balances — not yet posted to General Journal (In
                IDR).
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-1.5 text-caption"
            >
              <Link href="/reports/post-closing-trial-balance">
                <ArrowRight size={14} /> Post-Closing Trial Balance
              </Link>
            </Button>
          </div>

          {vm.groups.length === 0 && (
            <Alert className="text-ui">
              <Info size={16} />
              <AlertDescription className="text-caption">
                There are no nominal accounts with balances to close.
              </AlertDescription>
            </Alert>
          )}

          {vm.groups.map((group, gIdx) => (
            <ClosingGroupTable
              key={gIdx}
              group={group}
              totals={groupTotals[gIdx]}
            />
          ))}

          {vm.groups.length > 0 && (
            <Alert className="bg-sky-500/10 border-sky-500/20 text-sky-700 dark:text-sky-300 text-ui">
              <Info size={16} />
              <AlertDescription className="text-caption">
                After closing, all nominal accounts will have zero balance and
                Net Income of <strong>{formatNumber(vm.netIncome)}</strong> will
                transfer to <strong>{vm.retainedEarningsAccountName}</strong>.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );
}
