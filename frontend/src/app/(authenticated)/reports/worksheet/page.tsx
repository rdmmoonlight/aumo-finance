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
import { useGetApiV1ReportsWorksheetQuery } from "@/lib/generatedApi";
import { Grid, Calendar, EyeOff, TrendingUp, AlertTriangle, Loader2, Info } from "lucide-react";

export interface WorksheetRow {
  accountId: number;
  referenceNumber: number;
  accountName: string;
  type: string;
  normalBalanceIsDebit: boolean;
  unadjustedDebit: number;
  unadjustedCredit: number;
  adjustmentDebit: number;
  adjustmentCredit: number;
  adjustedDebit: number;
  adjustedCredit: number;
  incomeStatementDebit: number;
  incomeStatementCredit: number;
  financialPositionDebit: number;
  financialPositionCredit: number;
}

export interface WorksheetViewModel {
  rows: WorksheetRow[];
  netIncome: number;
  hasPeriodSelected: boolean;
}

export interface WorksheetTotals {
  unadjustedDebit: number;
  unadjustedCredit: number;
  adjustmentDebit: number;
  adjustmentCredit: number;
  adjustedDebit: number;
  adjustedCredit: number;
  isDebit: number;
  isCredit: number;
  bsDebit: number;
  bsCredit: number;
}

const formatNumber = (n: number) =>
  n === 0
    ? "-"
    : new Intl.NumberFormat("id-ID", {
        style: "decimal",
        maximumFractionDigits: 0,
      }).format(Math.abs(n));

const columnHelper = createColumnHelper<WorksheetRow>();

function WorksheetTable({
  rows,
  totals,
  netIncome,
}: {
  rows: WorksheetRow[];
  totals: WorksheetTotals;
  netIncome: number;
}) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("accountName", {
        id: "accountName",
        header: "Account",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-caption">
            <Badge variant="outline" className="font-mono text-label-small">
              {row.original.referenceNumber}
            </Badge>
            <span className="text-caption">{row.original.accountName}</span>
          </div>
        ),
      }),
      columnHelper.accessor("unadjustedDebit", {
        id: "unadjustedDebit",
        header: "Dr",
        cell: (info) => {
          const val = info.getValue();
          return val ? formatNumber(val) : "-";
        },
      }),
      columnHelper.accessor("unadjustedCredit", {
        id: "unadjustedCredit",
        header: "Cr",
        cell: (info) => {
          const val = info.getValue();
          return val ? formatNumber(val) : "-";
        },
      }),
      columnHelper.accessor("adjustmentDebit", {
        id: "adjustmentDebit",
        header: "Dr",
        cell: (info) => {
          const val = info.getValue();
          return val ? formatNumber(val) : "-";
        },
      }),
      columnHelper.accessor("adjustmentCredit", {
        id: "adjustmentCredit",
        header: "Cr",
        cell: (info) => {
          const val = info.getValue();
          return val ? formatNumber(val) : "-";
        },
      }),
      columnHelper.accessor("adjustedDebit", {
        id: "adjustedDebit",
        header: "Dr",
        cell: (info) => {
          const val = info.getValue();
          return val ? formatNumber(val) : "-";
        },
      }),
      columnHelper.accessor("adjustedCredit", {
        id: "adjustedCredit",
        header: "Cr",
        cell: (info) => {
          const val = info.getValue();
          return val ? formatNumber(val) : "-";
        },
      }),
      columnHelper.accessor("incomeStatementDebit", {
        id: "incomeStatementDebit",
        header: "Dr",
        cell: (info) => {
          const val = info.getValue();
          return val ? formatNumber(val) : "-";
        },
      }),
      columnHelper.accessor("incomeStatementCredit", {
        id: "incomeStatementCredit",
        header: "Cr",
        cell: (info) => {
          const val = info.getValue();
          return val ? formatNumber(val) : "-";
        },
      }),
      columnHelper.accessor("financialPositionDebit", {
        id: "financialPositionDebit",
        header: "Dr",
        cell: (info) => {
          const val = info.getValue();
          return val ? formatNumber(val) : "-";
        },
      }),
      columnHelper.accessor("financialPositionCredit", {
        id: "financialPositionCredit",
        header: "Cr",
        cell: (info) => {
          const val = info.getValue();
          return val ? formatNumber(val) : "-";
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
    <Table className="text-caption">
      <TableHeader>
        <TableRow className="bg-muted/50 text-caption">
          <TableHead
            rowSpan={2}
            className="sticky left-0 bg-muted/50 z-10 min-w-[200px] text-caption"
          >
            Account
          </TableHead>
          <TableHead colSpan={2} className="text-center border-l text-caption">
            Trial Balance
          </TableHead>
          <TableHead colSpan={2} className="text-center border-l text-caption">
            Adjustments
          </TableHead>
          <TableHead colSpan={2} className="text-center border-l text-caption">
            Adjusted TB
          </TableHead>
          <TableHead colSpan={2} className="text-center border-l text-caption">
            Income Statement
          </TableHead>
          <TableHead colSpan={2} className="text-center border-l text-caption">
            Balance Sheet
          </TableHead>
        </TableRow>
        <TableRow className="bg-muted/50 text-caption">
          <TableHead className="text-right text-caption">Dr</TableHead>
          <TableHead className="text-right text-caption">Cr</TableHead>
          <TableHead className="text-right border-l text-caption">Dr</TableHead>
          <TableHead className="text-right text-caption">Cr</TableHead>
          <TableHead className="text-right border-l text-caption">Dr</TableHead>
          <TableHead className="text-right text-caption">Cr</TableHead>
          <TableHead className="text-right border-l text-caption">Dr</TableHead>
          <TableHead className="text-right text-caption">Cr</TableHead>
          <TableHead className="text-right border-l text-caption">Dr</TableHead>
          <TableHead className="text-right text-caption">Cr</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => {
                const id = cell.column.id;
                const isAccountName = id === "accountName";
                const isAmber = id === "adjustmentDebit" || id === "adjustmentCredit";
                const isEmerald = id === "incomeStatementDebit" || id === "incomeStatementCredit";
                const isSky = id === "financialPositionDebit" || id === "financialPositionCredit";
                const isBorderLeft =
                  id === "adjustmentDebit" ||
                  id === "adjustedDebit" ||
                  id === "incomeStatementDebit" ||
                  id === "financialPositionDebit";

                if (isAccountName) {
                  return (
                    <TableCell
                      key={cell.id}
                      className="sticky left-0 bg-background font-medium flex items-center gap-2 text-caption"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  );
                }

                return (
                  <TableCell
                    key={cell.id}
                    className={`text-right font-mono text-caption ${isBorderLeft ? "border-l" : ""} ${
                      isAmber ? "text-amber-500" : ""
                    } ${isEmerald ? "text-emerald-500" : ""} ${
                      isSky ? "text-sky-500" : ""
                    }`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                );
              })}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={11}
              className="text-center py-6 text-muted-foreground text-caption"
            >
              No worksheet rows.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
      <TableFooter className="font-bold text-caption">
        {/* Row Total */}
        <TableRow>
          <TableCell className="sticky left-0 bg-muted text-right text-caption">
            Total
          </TableCell>
          <TableCell className="text-right font-mono text-caption">
            {formatNumber(totals.unadjustedDebit)}
          </TableCell>
          <TableCell className="text-right font-mono text-caption">
            {formatNumber(totals.unadjustedCredit)}
          </TableCell>
          <TableCell className="text-right font-mono text-amber-500 border-l text-caption">
            {formatNumber(totals.adjustmentDebit)}
          </TableCell>
          <TableCell className="text-right font-mono text-amber-500 text-caption">
            {formatNumber(totals.adjustmentCredit)}
          </TableCell>
          <TableCell className="text-right font-mono border-l text-caption">
            {formatNumber(totals.adjustedDebit)}
          </TableCell>
          <TableCell className="text-right font-mono text-caption">
            {formatNumber(totals.adjustedCredit)}
          </TableCell>
          <TableCell className="text-right font-mono text-emerald-500 border-l text-caption">
            {formatNumber(totals.isDebit)}
          </TableCell>
          <TableCell className="text-right font-mono text-emerald-500 text-caption">
            {formatNumber(totals.isCredit)}
          </TableCell>
          <TableCell className="text-right font-mono text-sky-500 border-l text-caption">
            {formatNumber(totals.bsDebit)}
          </TableCell>
          <TableCell className="text-right font-mono text-sky-500 text-caption">
            {formatNumber(totals.bsCredit)}
          </TableCell>
        </TableRow>

        {/* Row Net Income Plug */}
        <TableRow>
          <TableCell
            colSpan={7}
            className="sticky left-0 bg-muted text-right text-caption"
          >
            Net Income (plug)
          </TableCell>
          <TableCell className="text-right font-mono text-emerald-500 border-l text-caption">
            {netIncome >= 0 ? formatNumber(netIncome) : "-"}
          </TableCell>
          <TableCell className="text-right font-mono text-emerald-500 text-caption">
            {netIncome < 0 ? formatNumber(Math.abs(netIncome)) : "-"}
          </TableCell>
          <TableCell className="text-right font-mono text-sky-500 border-l text-caption">
            {netIncome < 0 ? formatNumber(Math.abs(netIncome)) : "-"}
          </TableCell>
          <TableCell className="text-right font-mono text-sky-500 text-caption">
            {netIncome >= 0 ? formatNumber(netIncome) : "-"}
          </TableCell>
        </TableRow>

        {/* Row Total After Plug */}
        <TableRow className="bg-primary/5">
          <TableCell
            colSpan={7}
            className="sticky left-0 bg-primary/5 text-right text-caption"
          >
            Total (after plug)
          </TableCell>
          <TableCell className="text-right font-mono text-emerald-500 border-l text-caption">
            {formatNumber(
              totals.isDebit + (netIncome >= 0 ? netIncome : 0),
            )}
          </TableCell>
          <TableCell className="text-right font-mono text-emerald-500 text-caption">
            {formatNumber(
              totals.isCredit + (netIncome < 0 ? Math.abs(netIncome) : 0),
            )}
          </TableCell>
          <TableCell className="text-right font-mono text-sky-500 border-l text-caption">
            {formatNumber(
              totals.bsDebit + (netIncome < 0 ? Math.abs(netIncome) : 0),
            )}
          </TableCell>
          <TableCell className="text-right font-mono text-sky-500 text-caption">
            {formatNumber(
              totals.bsCredit + (netIncome >= 0 ? netIncome : 0),
            )}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}

export default function WorksheetPage() {
  // Panggil hook RTK Query
  const { data, isLoading, isError, error } =
    useGetApiV1ReportsWorksheetQuery();

  // Mapping data dari respon API RTK Query
  const vm: WorksheetViewModel = useMemo(() => {
    const rawData = data as any;
    if (!rawData) {
      return { rows: [], netIncome: 0, hasPeriodSelected: true };
    }

    const rawRows = rawData.rows || [];
    const mappedRows: WorksheetRow[] = rawRows.map((r: any) => ({
      accountId: Number(r.accountId) || 0,
      referenceNumber: Number(r.referenceNumber) || 0,
      accountName: r.accountName || "",
      type: r.type || "",
      normalBalanceIsDebit: r.normalBalanceIsDebit ?? true,
      unadjustedDebit: Number(r.tbDebit) || 0,
      unadjustedCredit: Number(r.tbCredit) || 0,
      adjustmentDebit: Number(r.adjDebit) || 0,
      adjustmentCredit: Number(r.adjCredit) || 0,
      adjustedDebit: Number(r.adjTbDebit) || 0,
      adjustedCredit: Number(r.adjTbCredit) || 0,
      incomeStatementDebit: Number(r.isDebit) || 0,
      incomeStatementCredit: Number(r.isCredit) || 0,
      financialPositionDebit: Number(r.bsDebit) || 0,
      financialPositionCredit: Number(r.bsCredit) || 0,
    }));

    return {
      rows: mappedRows,
      netIncome: Number(rawData.totals?.netIncome) || 0,
      hasPeriodSelected: rawData.hasPeriodSelected !== false,
    };
  }, [data]);

  // Hitung total tiap kolom
  const totals: WorksheetTotals = useMemo(
    () =>
      vm.rows.reduce(
        (acc, r) => {
          acc.unadjustedDebit += r.unadjustedDebit;
          acc.unadjustedCredit += r.unadjustedCredit;
          acc.adjustmentDebit += r.adjustmentDebit;
          acc.adjustmentCredit += r.adjustmentCredit;
          acc.adjustedDebit += r.adjustedDebit;
          acc.adjustedCredit += r.adjustedCredit;
          acc.isDebit += r.incomeStatementDebit;
          acc.isCredit += r.incomeStatementCredit;
          acc.bsDebit += r.financialPositionDebit;
          acc.bsCredit += r.financialPositionCredit;
          return acc;
        },
        {
          unadjustedDebit: 0,
          unadjustedCredit: 0,
          adjustmentDebit: 0,
          adjustmentCredit: 0,
          adjustedDebit: 0,
          adjustedCredit: 0,
          isDebit: 0,
          isCredit: 0,
          bsDebit: 0,
          bsCredit: 0,
        },
      ),
    [vm.rows],
  );

  // Ambil pesan error jika ada
  const errorMessage = useMemo(() => {
    if (!isError || !error) return null;
    if ("data" in error) {
      return (error.data as any)?.message || "Gagal memuat data worksheet.";
    }
    return "Terjadi kesalahan koneksi.";
  }, [isError, error]);

  if (isLoading) {
    return (
      <div className="py-16 text-center text-caption text-muted-foreground flex items-center justify-center gap-2">
        <Loader2 className="animate-spin" size={16} /> Loading Worksheet...
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

      {!vm.hasPeriodSelected ? (
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
                <Grid className="text-sky-500" size={22} /> 10-Column
                Worksheet
              </h1>
              <p className="text-ui text-muted-foreground mt-1">
                Trial Balance → Adjustments → Adjusted TB → Income Statement →
                Balance Sheet • IDR
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="gap-1.5 text-caption">
              <Link href="/reports/income-statement">
                <TrendingUp size={14} /> Income Statement
              </Link>
            </Button>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="p-0 overflow-auto">
              <WorksheetTable
                rows={vm.rows}
                totals={totals}
                netIncome={vm.netIncome}
              />
            </CardContent>
          </Card>

          <Alert className="bg-sky-500/10 border-sky-500/20 text-ui">
            <Info size={16} />
            <AlertDescription className="text-caption">
              Net Income: <strong>{formatNumber(vm.netIncome)}</strong> —
              plugged from Income Statement to Balance Sheet.
            </AlertDescription>
          </Alert>
        </>
      )}
    </div>
  );
}
