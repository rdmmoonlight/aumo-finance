"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber } from "../_lib/format";
import { TrialRow } from "../_lib/types";

export function TrialTable({
  rows,
  totalDebit,
  totalCredit,
}: {
  rows: TrialRow[];
  totalDebit: number;
  totalCredit: number;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[10%] pl-6 text-center text-caption">
                Ref.
              </TableHead>
              <TableHead className="w-[50%] text-caption">Account</TableHead>
              <TableHead className="w-[15%] text-caption">Type</TableHead>
              <TableHead className="w-[12%] text-right text-caption">
                Debit
              </TableHead>
              <TableHead className="w-[13%] pr-6 text-right text-caption">
                Credit
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row) => (
                <TableRow
                  key={String(
                    row.accountId || `${row.type}-${row.accountName}`,
                  )}
                >
                  <TableCell className="pl-6">
                    <div className="text-center">
                      <Badge
                        variant="outline"
                        className="font-mono text-amber-500 text-label-small"
                      >
                        {row.referenceNumber || "-"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-caption font-medium">
                    {row.accountName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-label-small">
                      {row.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-mono text-caption text-emerald-500 text-right">
                      {(row.debit ?? 0) > 0
                        ? formatNumber(row.debit ?? 0)
                        : "-"}
                    </div>
                  </TableCell>
                  <TableCell className="pr-6">
                    <div className="font-mono text-caption text-red-500 text-right">
                      {(row.credit ?? 0) > 0
                        ? formatNumber(row.credit ?? 0)
                        : "-"}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-caption text-muted-foreground"
                >
                  No accounts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow className="font-bold text-caption">
              <TableCell colSpan={3} className="pl-6 text-right">
                Total
              </TableCell>
              <TableCell className="text-right font-mono text-emerald-500">
                {formatNumber(totalDebit)}
              </TableCell>
              <TableCell className="pr-6 text-right font-mono text-red-500">
                {formatNumber(totalCredit)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
