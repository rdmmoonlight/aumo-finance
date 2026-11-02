"use client";

import { formatNumber } from "#/features/reports/financial-statements/_lib/formatters";
import { StatementRow } from "#/features/reports/financial-statements/_types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function RetainedEarningsTable({ data }: { data: StatementRow[] }) {
  return (
    <Table>
      <TableHeader className="sr-only">
        <TableRow>
          <TableHead>Keterangan</TableHead>
          <TableHead>
            <div className="text-right pr-4 text-caption">Jumlah (IDR)</div>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow
            key={item.id}
            className={
              item.isTotal
                ? "bg-primary/5 border-t-2 hover:bg-primary/5"
                : "hover:bg-transparent"
            }
          >
            <TableCell className="w-[65%] p-4">
              <span
                className={`${item.isIndent ? "pl-8 text-muted-foreground text-caption" : ""} ${
                  item.isTotal ? "font-bold text-body" : "font-medium text-ui"
                }`}
              >
                {item.label}
              </span>
            </TableCell>
            <TableCell className="w-[35%] p-4">
              <div
                className={`text-right pr-4 font-mono font-medium text-ui ${
                  item.isTotal ? "text-emerald-500 font-bold text-body" : ""
                } ${item.valueColorClass || ""}`}
              >
                {item.isNegativeFormat
                  ? `(${formatNumber(item.amount)})`
                  : formatNumber(item.amount)}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
