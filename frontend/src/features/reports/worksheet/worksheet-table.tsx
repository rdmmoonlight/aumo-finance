"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WorksheetRow, WorksheetTotals } from "./types";
import { formatNumber } from "./utils";

const fmt = (v: number | null | undefined) => (v ? formatNumber(v) : "-");

export function WorksheetTable({
  rows,
  totals,
  netIncome,
}: {
  rows: WorksheetRow[];
  totals: WorksheetTotals;
  netIncome: number;
}) {
  return (
    <div className="rounded-md border overflow-auto">
      <Table className="text-caption">
        <TableCaption>Worksheet - 10 column accounting worksheet</TableCaption>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead rowSpan={2} className="sticky left-0 z-20 bg-muted/50 min-w-">
              Account
            </TableHead>
            <TableHead colSpan={2} className="text-center border-l">Trial Balance</TableHead>
            <TableHead colSpan={2} className="text-center border-l">Adjustments</TableHead>
            <TableHead colSpan={2} className="text-center border-l">Adjusted TB</TableHead>
            <TableHead colSpan={2} className="text-center border-l">Income Statement</TableHead>
            <TableHead colSpan={2} className="text-center border-l">Balance Sheet</TableHead>
          </TableRow>
          <TableRow className="bg-muted/50">
            <TableHead className="text-right">Dr</TableHead>
            <TableHead className="text-right">Cr</TableHead>
            <TableHead className="text-right border-l">Dr</TableHead>
            <TableHead className="text-right">Cr</TableHead>
            <TableHead className="text-right border-l">Dr</TableHead>
            <TableHead className="text-right">Cr</TableHead>
            <TableHead className="text-right border-l">Dr</TableHead>
            <TableHead className="text-right">Cr</TableHead>
            <TableHead className="text-right border-l">Dr</TableHead>
            <TableHead className="text-right">Cr</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.length ? (
            rows.map((row) => (
              <TableRow key={row.accountId}>
                <TableCell className="sticky left-0 z-10 bg-background">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-">
                      {row.referenceNumber}
                    </Badge>
                    <span>{row.accountName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono">{fmt(row.unadjustedDebit)}</TableCell>
                <TableCell className="text-right font-mono">{fmt(row.unadjustedCredit)}</TableCell>
                <TableCell className="text-right font-mono text-amber-500 border-l">{fmt(row.adjustmentDebit)}</TableCell>
                <TableCell className="text-right font-mono text-amber-500">{fmt(row.adjustmentCredit)}</TableCell>
                <TableCell className="text-right font-mono border-l">{fmt(row.adjustedDebit)}</TableCell>
                <TableCell className="text-right font-mono">{fmt(row.adjustedCredit)}</TableCell>
                <TableCell className="text-right font-mono text-emerald-500 border-l">{fmt(row.incomeStatementDebit)}</TableCell>
                <TableCell className="text-right font-mono text-emerald-500">{fmt(row.incomeStatementCredit)}</TableCell>
                <TableCell className="text-right font-mono text-sky-500 border-l">{fmt(row.financialPositionDebit)}</TableCell>
                <TableCell className="text-right font-mono text-sky-500">{fmt(row.financialPositionCredit)}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={11} className="h-24 text-center text-muted-foreground">
                No worksheet rows.
              </TableCell>
            </TableRow>
          )}
        </TableBody>

        <TableFooter className="font-bold">
          <TableRow>
            <TableCell className="sticky left-0 bg-muted text-right">Total</TableCell>
            <TableCell className="text-right font-mono">{formatNumber(totals.unadjustedDebit)}</TableCell>
            <TableCell className="text-right font-mono">{formatNumber(totals.unadjustedCredit)}</TableCell>
            <TableCell className="text-right font-mono text-amber-500 border-l">{formatNumber(totals.adjustmentDebit)}</TableCell>
            <TableCell className="text-right font-mono text-amber-500">{formatNumber(totals.adjustmentCredit)}</TableCell>
            <TableCell className="text-right font-mono border-l">{formatNumber(totals.adjustedDebit)}</TableCell>
            <TableCell className="text-right font-mono">{formatNumber(totals.adjustedCredit)}</TableCell>
            <TableCell className="text-right font-mono text-emerald-500 border-l">{formatNumber(totals.isDebit)}</TableCell>
            <TableCell className="text-right font-mono text-emerald-500">{formatNumber(totals.isCredit)}</TableCell>
            <TableCell className="text-right font-mono text-sky-500 border-l">{formatNumber(totals.bsDebit)}</TableCell>
            <TableCell className="text-right font-mono text-sky-500">{formatNumber(totals.bsCredit)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={7} className="sticky left-0 bg-muted text-right">Net Income (plug)</TableCell>
            <TableCell className="text-right font-mono text-emerald-500 border-l">{netIncome >= 0 ? formatNumber(netIncome) : "-"}</TableCell>
            <TableCell className="text-right font-mono text-emerald-500">{netIncome < 0 ? formatNumber(Math.abs(netIncome)) : "-"}</TableCell>
            <TableCell className="text-right font-mono text-sky-500 border-l">{netIncome < 0 ? formatNumber(Math.abs(netIncome)) : "-"}</TableCell>
            <TableCell className="text-right font-mono text-sky-500">{netIncome >= 0 ? formatNumber(netIncome) : "-"}</TableCell>
          </TableRow>
          <TableRow className="bg-primary/5">
            <TableCell colSpan={7} className="sticky left-0 bg-primary/5 text-right">Total (after plug)</TableCell>
            <TableCell className="text-right font-mono text-emerald-500 border-l">{formatNumber(totals.isDebit + (netIncome >= 0 ? netIncome : 0))}</TableCell>
            <TableCell className="text-right font-mono text-emerald-500">{formatNumber(totals.isCredit + (netIncome < 0 ? Math.abs(netIncome) : 0))}</TableCell>
            <TableCell className="text-right font-mono text-sky-500 border-l">{formatNumber(totals.bsDebit + (netIncome < 0 ? Math.abs(netIncome) : 0))}</TableCell>
            <TableCell className="text-right font-mono text-sky-500">{formatNumber(totals.bsCredit + (netIncome >= 0 ? netIncome : 0))}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
