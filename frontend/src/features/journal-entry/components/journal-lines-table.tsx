"use client";

import {
  AccountOption,
  formatIDR,
  LineItem,
} from "#/features/journal-entry/utils/helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, CheckCircle2, Plus, Trash2 } from "lucide-react";

type Props = {
  fields: LineItem[];
  availableAccounts: AccountOption[];
  watchedLines: any[];
  register: any;
  setValue: any;
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  onAddLine: () => void;
  onRemoveLine: (index: number) => void;
  onAmountChange: (index: number, field: "debit" | "credit", value: string) => void;
};

export function JournalLinesTable({
  fields,
  availableAccounts,
  watchedLines,
  register,
  setValue,
  totalDebit,
  totalCredit,
  isBalanced,
  onAddLine,
  onRemoveLine,
  onAmountChange,
}: Props) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="py-3 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold">Journal Lines</CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 gap-1 text-xs"
          onClick={onAddLine}
        >
          <Plus size={12} /> Add Line
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[10%] font-semibold uppercase tracking-wider text-muted-foreground">
                Ref
              </TableHead>
              <TableHead className="w-[28%] font-semibold uppercase tracking-wider text-muted-foreground">
                Account
              </TableHead>
              <TableHead className="font-semibold uppercase tracking-wider text-muted-foreground">
                Description
              </TableHead>
              <TableHead className="w-[15%] text-right font-semibold uppercase tracking-wider text-muted-foreground">
                Debit
              </TableHead>
              <TableHead className="w-[15%] text-right font-semibold uppercase tracking-wider text-muted-foreground">
                Credit
              </TableHead>
              <TableHead className="w-[5%] text-center font-semibold uppercase tracking-wider text-muted-foreground">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field, index) => {
              const currentAccountId = watchedLines?.[index]?.accountId;

              // Menggunakan perbandingan string agar aman dari perbedaan tipe data (string vs number)
              const selectedAccount = availableAccounts.find(
                (a) => String(a.id) === String(currentAccountId)
              );
              const ref = selectedAccount?.referenceNumber;

              return (
                <TableRow key={field.id}>
                  <TableCell>
                    <Input
                      className="h-8 text-center text-xs bg-muted font-mono"
                      readOnly
                      value={ref || ""}
                      placeholder="---"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={
                        currentAccountId !== undefined && currentAccountId !== null
                          ? String(currentAccountId)
                          : ""
                      }
                      onValueChange={(v) => {
                        // Mencari account sesuai tipe ID aslinya
                        const matched = availableAccounts.find(
                          (a) => String(a.id) === v
                        );
                        setValue(
                          `lines.${index}.accountId`,
                          matched ? matched.id : v,
                          {
                            shouldValidate: true,
                          }
                        );
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select Account" />
                      </SelectTrigger>
                      <SelectContent className="text-xs">
                        {availableAccounts.map((acc) => (
                          <SelectItem
                            key={acc.id}
                            value={String(acc.id)}
                            className="text-xs"
                          >
                            {acc.referenceNumber} - {acc.accountName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      className="h-8 text-xs"
                      placeholder="Note..."
                      {...register(`lines.${index}.lineDescription`)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      className="h-8 text-xs text-right font-mono"
                      placeholder="0"
                      value={watchedLines?.[index]?.debit || ""}
                      onChange={(e) =>
                        onAmountChange(index, "debit", e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      className="h-8 text-xs text-right font-mono"
                      placeholder="0"
                      value={watchedLines?.[index]?.credit || ""}
                      onChange={(e) =>
                        onAmountChange(index, "credit", e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => onRemoveLine(index)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3} className="text-right text-xs font-medium">
                Total:
              </TableCell>
              <TableCell className="text-right font-mono text-xs text-emerald-500">
                Rp {formatIDR(totalDebit)}
              </TableCell>
              <TableCell className="text-right font-mono text-xs text-red-500">
                Rp {formatIDR(totalCredit)}
              </TableCell>
              <TableCell />
            </TableRow>
            <TableRow>
              <TableCell colSpan={3} className="text-right text-xs">
                Status:
              </TableCell>
              <TableCell colSpan={2} className="text-center">
                {isBalanced ? (
                  <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20 gap-1">
                    <CheckCircle2 size={12} /> Balanced
                  </Badge>
                ) : (
                  <Badge
                    variant="destructive"
                    className="gap-1 bg-red-500/15 text-red-500 border-red-500/20"
                  >
                    <AlertTriangle size={12} /> Unbalanced Rp{" "}
                    {formatIDR(Math.abs(totalDebit - totalCredit))}
                  </Badge>
                )}
              </TableCell>
              <TableCell />
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
