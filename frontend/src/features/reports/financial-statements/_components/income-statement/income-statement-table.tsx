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
import { formatNumber } from "../../_lib/formatters";
import { IncomeStatementLine } from "../../_types";

type Props = {
  title: string;
  lines: IncomeStatementLine[];
  totalLabel: string;
  total: number;
  variant?: "default" | "gross" | "net";
};

export function IncomeStatementSectionTable({
  title,
  lines,
  totalLabel,
  total,
  variant = "default",
}: Props) {
  return (
    <div className="space-y-2">
      <div className="text-caption font-bold tracking-widest text-amber-500 uppercase">
        {title}
      </div>
      {lines.length === 0 ? (
        <div className="p-4 text-caption text-muted-foreground italic">
          No {title.toLowerCase()}.
        </div>
      ) : (
        <Table>
          <TableHeader className="sr-only">
            <TableRow>
              <TableHead className="text-caption">Ref</TableHead>
              <TableHead className="text-caption">Account</TableHead>
              <TableHead className="text-right text-caption">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.map((line, idx) => {
              const displayName = line.accountName || line.description;
              const amount = Number(line.amount) || 0;

              return (
                <TableRow key={`${line.referenceNumber}-${idx}`}>
                  <TableCell className="w-[15%] p-3">
                    {line.referenceNumber ? (
                      <Badge
                        variant="outline"
                        className="font-mono text-label-small"
                      >
                        {line.referenceNumber}
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell className="p-3">
                    <span className="text-ui font-medium">
                      {displayName || "-"}
                    </span>
                  </TableCell>
                  <TableCell className="w-[30%] p-3">
                    <div
                      className={`text-right font-mono text-caption ${amount < 0 ? "text-red-500" : ""}`}
                    >
                      {formatNumber(amount)}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter
            className={`${variant === "net" ? "bg-primary/10" : "bg-transparent"} border-t`}
          >
            <TableRow className="font-semibold text-ui hover:bg-transparent">
              <TableCell colSpan={2} className="p-4">
                {totalLabel}
              </TableCell>
              <TableCell
                className={`p-4 text-right font-mono ${variant === "net" ? "text-emerald-600 font-bold" : variant === "gross" ? "text-sky-600" : ""}`}
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
