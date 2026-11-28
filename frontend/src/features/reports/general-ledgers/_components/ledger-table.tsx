"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber } from "../_lib/format";
import { LedgerLine } from "../_lib/types";

export function LedgerTable({ lines }: { lines: LedgerLine[] }) {
  if (!lines?.length) {
    return (
      <Table>
        <TableBody>
          <TableRow>
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
        <TableRow>
          <TableHead className="pl-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Date
          </TableHead>
          <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Description
          </TableHead>
          <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Debit
          </TableHead>
          <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Credit
          </TableHead>
          <TableHead className="text-right pr-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Balance
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lines.map((line, idx) => (
          <TableRow key={`${line.entryDate}-${idx}`}>
            <TableCell className="pl-6 text-xs text-muted-foreground">
              {line.entryDate}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {line.description || "-"}
            </TableCell>
            <TableCell className="text-right">
              <span className="font-mono text-xs text-emerald-500">
                {line.debit > 0 ? formatNumber(line.debit) : "-"}
              </span>
            </TableCell>
            <TableCell className="text-right">
              <span className="font-mono text-xs text-red-500">
                {line.credit > 0 ? formatNumber(line.credit) : "-"}
              </span>
            </TableCell>
            <TableCell className="pr-6 text-right">
              <span className="font-mono text-xs font-medium">
                {formatNumber(line.runningBalance)}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
