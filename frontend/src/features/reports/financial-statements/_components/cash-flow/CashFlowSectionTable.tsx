"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber } from "../../_lib/formatters";
import { CashFlowLine } from "../../_types";

export function CashFlowSectionTable({
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
            <TableRow>
              <TableHead>Deskripsi</TableHead>
              <TableHead className="text-right pr-4 text-caption">Jumlah</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.map((line, idx) => (
              <TableRow key={idx} className="border-none hover:bg-transparent">
                <TableCell className="py-1 w-[75%]">
                  <span className="text-ui font-medium pl-4">{line.description}</span>
                </TableCell>
                <TableCell className="py-1 w-[25%]">
                  <div
                    className={`text-right pr-4 font-mono text-caption ${(line.amount || 0) < 0 ? "text-red-500" : "text-emerald-500"
                      }`}
                  >
                    {formatNumber(line.amount || 0)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter className="bg-transparent border-t">
            <TableRow className="font-semibold text-ui hover:bg-transparent">
              <TableCell className="pl-4 py-2">{totalLabel}</TableCell>
              <TableCell
                className={`text-right pr-4 py-2 font-mono ${total < 0 ? "text-red-500" : "text-emerald-500"
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