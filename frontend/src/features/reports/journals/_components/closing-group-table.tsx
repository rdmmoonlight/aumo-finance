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
import { formatNumberWithParen } from "../_lib/format";
import { ClosingJournalEntryGroup, ClosingJournalLine } from "../_lib/types";

export function ClosingGroupTable({
  group,
  totals,
}: {
  group: ClosingJournalEntryGroup;
  totals: { totalDebit: number; totalCredit: number };
}) {
  const lines: ClosingJournalLine[] = group.lines || [];

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="py-3 bg-muted/30 border-b">
        <CardTitle className="text-ui">{group.description}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table className="min-w-">
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="text-center text-caption">Ref.</div>
              </TableHead>
              <TableHead>Account</TableHead>
              <TableHead>
                <div className="text-right text-caption">Debit</div>
              </TableHead>
              <TableHead>
                <div className="text-right pr-6 text-caption">Credit</div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.map((line, idx) => (
              <TableRow key={`${line.referenceNumber}-${line.accountName}-${idx}`}>
                {/* Ref. */}
                <TableCell>
                  <div className="text-center pl-6">
                    <Badge
                      variant="outline"
                      className="font-mono text-amber-500 text-label-small"
                    >
                      {line.referenceNumber || "-"}
                    </Badge>
                  </div>
                </TableCell>

                {/* Account */}
                <TableCell>
                  <div
                    className={`text-caption ${line.credit > 0 ? "pl-6 text-muted-foreground" : "font-medium"}`}
                  >
                    {line.accountName}
                  </div>
                </TableCell>

                {/* Debit */}
                <TableCell>
                  <div className="text-right font-mono text-caption text-emerald-500">
                    {line.debit > 0 ? formatNumberWithParen(line.debit) : "-"}
                  </div>
                </TableCell>

                {/* Credit */}
                <TableCell>
                  <div className="text-right pr-6 font-mono text-caption text-red-500">
                    {line.credit > 0 ? formatNumberWithParen(line.credit) : "-"}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow className="font-bold">
              <TableCell colSpan={2} className="text-right">
                Total
              </TableCell>
              <TableCell className="text-right font-mono text-emerald-500">
                {formatNumberWithParen(totals.totalDebit)}
              </TableCell>
              <TableCell className="text-right pr-6 font-mono text-red-500">
                {formatNumberWithParen(totals.totalCredit)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
