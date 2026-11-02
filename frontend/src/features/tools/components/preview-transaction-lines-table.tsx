"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMemo } from "react";
import { formatIDR } from "../constants";
import { AccountMappingDetail, JournalLineImport } from "../types";

export function PreviewTransactionLinesTable({
  lines,
  accountMappings,
}: {
  lines: JournalLineImport[];
  accountMappings: AccountMappingDetail[];
}) {
  const totalDebit = useMemo(
    () => lines.reduce((a, b) => a + (b.debit || 0), 0),
    [lines],
  );
  const totalCredit = useMemo(
    () => lines.reduce((a, b) => a + (b.credit || 0), 0),
    [lines],
  );

  return (
    <Table>
      <TableHeader>
        <TableRow className="text-caption">
          <TableHead className="w-10">#</TableHead>
          <TableHead className="w-20">Ref</TableHead>
          <TableHead>Account</TableHead>
          <TableHead className="text-right">Debit</TableHead>
          <TableHead className="text-right">Credit</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lines.map((line, idx) => {
          const mapping = accountMappings.find(
            (m) =>
              m.excelRef === line.refNumber &&
              m.excelAccountName === line.accountName,
          );
          const isUnmapped = !mapping?.mappedRef;

          return (
            <TableRow
              key={`${line.rowIndex}-${idx}`}
              className={isUnmapped ? "bg-destructive/10" : ""}
            >
              <TableCell>
                <span className="text-caption">{line.rowIndex}</span>
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className="font-mono text-label-small"
                >
                  {line.refNumber}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="text-caption">
                  <div className="font-medium">{line.accountName}</div>
                  <div className="text-caption text-muted-foreground truncate">
                    {line.description}
                  </div>
                  {mapping?.mappedRef ? (
                    <Badge className="mt-1 bg-amber-500/15 text-amber-600 border-amber-500/20 text-label-small">
                      → [{mapping.mappedRef}] {mapping.mappedAccountName}
                    </Badge>
                  ) : (
                    <Badge
                      variant="destructive"
                      className="mt-1 text-label-small"
                    >
                      Unmapped
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-right font-mono text-caption">
                  {line.debit !== null ? formatIDR(line.debit) : "-"}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-right font-mono text-caption">
                  {line.credit !== null ? formatIDR(line.credit) : "-"}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell
            colSpan={3}
            className="text-right font-medium text-caption"
          >
            Total
          </TableCell>
          <TableCell className="text-right font-mono text-caption font-bold">
            {formatIDR(totalDebit)}
          </TableCell>
          <TableCell className="text-right font-mono text-caption font-bold">
            {formatIDR(totalCredit)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
