"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { FinancialPositionLine } from "../../_types";

type Props = {
  title: string;
  lines: FinancialPositionLine[];
  totalAmount: number;
  totalLabel: string;
  emptyMessage: string;
  totalColorClass?: string;
};

export function FinancialPositionSectionTable({
  title,
  lines,
  totalAmount,
  totalLabel,
  emptyMessage,
  totalColorClass = "",
}: Props) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="py-3 bg-muted/30 border-b">
        <CardTitle className="tracking-widest uppercase text-amber-500 text-caption">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {lines.length === 0 ? (
          <div className="p-4 text-caption text-muted-foreground italic">
            {emptyMessage}
          </div>
        ) : (
          <Table>
            <TableHeader className="sr-only">
              <TableRow>
                <TableHead className="text-caption">Ref</TableHead>
                <TableHead className="text-caption">Account</TableHead>
                <TableHead className="text-right text-caption">
                  Amount
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((line, idx) => (
                <TableRow key={`${line.referenceNumber}-${idx}`}>
                  <TableCell className="w-[15%] p-3 px-4">
                    {line.referenceNumber ? (
                      <Badge
                        variant="outline"
                        className="font-mono text-label-small"
                      >
                        {line.referenceNumber}
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell className="p-3 px-4">
                    <span className="text-ui font-medium">
                      {line.accountName || "-"}
                    </span>
                  </TableCell>
                  <TableCell className="w-[30%] p-3 px-4">
                    <div className="text-right font-mono text-caption">
                      {formatNumber(Number(line.amount) || 0)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter className="bg-transparent border-t">
              <TableRow className="font-semibold text-ui hover:bg-transparent">
                <TableCell colSpan={2} className="p-4">
                  {totalLabel}
                </TableCell>
                <TableCell
                  className={`p-4 text-right font-mono ${totalColorClass}`}
                >
                  {formatNumber(totalAmount)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
