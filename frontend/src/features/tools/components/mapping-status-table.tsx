"use client";

import { Badge } from "@/components/ui/badge";
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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AccountMappingDetail } from "../types";

export function MappingStatusTable({
  mappings,
  dbAccounts,
  isLoadingCoa,
  onMappingChange,
}: {
  mappings: AccountMappingDetail[];
  dbAccounts: any[];
  isLoadingCoa: boolean;
  onMappingChange: (
    excelRef: number,
    excelName: string,
    targetRef: number,
  ) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="text-caption">
          <TableHead>Excel Input</TableHead>
          <TableHead>Target COA</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mappings.map((row) => (
          <TableRow
            key={`${row.excelRef}-${row.excelAccountName}`}
            className={row.mappedRef ? "bg-amber-500/10" : ""}
          >
            <TableCell>
              <div className="text-caption">
                <Badge
                  variant="outline"
                  className="font-mono text-label-small mr-1"
                >
                  {row.excelRef}
                </Badge>
                {row.excelAccountName}
              </div>
            </TableCell>
            <TableCell>
              <Select
                value={String(row.mappedRef || 0)}
                onValueChange={(v) =>
                  onMappingChange(row.excelRef, row.excelAccountName, Number(v))
                }
                disabled={isLoadingCoa}
              >
                <SelectTrigger className="h-7 text-caption">
                  <SelectValue placeholder="Pilih COA" />
                </SelectTrigger>
                <SelectContent>
                  {dbAccounts.map((o: any) => {
                    const refNum = o.referenceNumber || o.code;
                    const accName = o.accountName || o.name;
                    return (
                      <SelectItem
                        key={o.id || refNum}
                        value={String(refNum)}
                        className="text-caption"
                      >
                        [{refNum}] {accName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
