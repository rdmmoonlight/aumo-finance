"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface AccountBalanceItem {
  accountId: number;
  referenceNumber: string;
  accountName: string;
  balance: number;
}
export interface TrendItem {
  label: string;
  revenue: number;
  expense: number;
  net: number;
}

export const formatNumber = (amount: number) => {
  const isNeg = amount < 0;
  const formatted = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
  return isNeg ? `(${formatted})` : formatted;
};

export function ExpenseTable({ data }: { data: AccountBalanceItem[] }) {
  if (!data?.length) {
    return (
      <div className="py-8 text-center text-caption text-muted-foreground">
        No expenses recorded for this period.
      </div>
    );
  }

  return (
    <Table>
      <TableCaption>Expense breakdown for this period</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="text-caption h-8">Ref No.</TableHead>
          <TableHead className="text-caption h-8">Account Name</TableHead>
          <TableHead className="text-caption h-8 text-right">
            Balance (IDR)
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.accountId}>
            <TableCell className="py-2">
              <span className="font-mono text-caption text-muted-foreground">
                {item.referenceNumber || "---"}
              </span>
            </TableCell>
            <TableCell className="py-2">
              <span className="font-medium text-caption">
                {item.accountName}
              </span>
            </TableCell>
            <TableCell className="py-2">
              <div className="text-right font-mono text-caption font-semibold text-red-500">
                {formatNumber(item.balance)}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function TrendTable({ data }: { data: TrendItem[] }) {
  if (!data?.length) {
    return (
      <div className="py-8 text-center text-caption text-muted-foreground">
        No trend data available.
      </div>
    );
  }

  return (
    <Table>
      <TableCaption>Revenue vs Expense trend</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="text-caption h-8">Period</TableHead>
          <TableHead className="text-caption h-8 text-right">Revenue</TableHead>
          <TableHead className="text-caption h-8 text-right">Expenses</TableHead>
          <TableHead className="text-caption h-8 text-right">Net Income</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.label}>
            <TableCell className="py-2">
              <span className="font-semibold text-caption">{item.label}</span>
            </TableCell>
            <TableCell className="py-2">
              <div className="text-right font-mono text-caption text-emerald-500">
                {formatNumber(item.revenue)}
              </div>
            </TableCell>
            <TableCell className="py-2">
              <div className="text-right font-mono text-caption text-red-500">
                {formatNumber(item.expense)}
              </div>
            </TableCell>
            <TableCell className="py-2">
              <div
                className={cn(
                  "text-right font-mono text-caption font-semibold",
                  item.net >= 0 ? "text-emerald-600" : "text-red-600"
                )}
              >
                {formatNumber(item.net)}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}