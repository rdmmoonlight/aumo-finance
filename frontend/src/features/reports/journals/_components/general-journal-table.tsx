"use client";

import { Link } from '@tanstack/react-router';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar, Clock, Pencil, Trash2 } from "lucide-react";
import { Fragment } from "react";

import { formatDateTimeDisplay, formatNumber } from "../_lib/format";
import { FlatJournalRow } from "../_lib/types";

type GeneralJournalTableProps = {
  flatData: FlatJournalRow[];
  editMode: boolean;
  isDeleting: boolean;
  onPromptDelete: (entry: FlatJournalRow["originalEntry"]) => void;
};

export function GeneralJournalTable({
  flatData,
  editMode,
  isDeleting,
  onPromptDelete,
}: GeneralJournalTableProps) {
  return (
    <Table className="min-w- table-fixed">
      <TableHeader>
        <TableRow>
          <TableHead>
            <span className="pl-4 text- font-semibold uppercase">
              No. Transaksi
            </span>
          </TableHead>
          <TableHead>
            <span className="text- font-semibold uppercase">Account</span>
          </TableHead>
          <TableHead>
            <span className="text- font-semibold uppercase">Description</span>
          </TableHead>
          <TableHead>
            <div className="text-center text- font-semibold uppercase">
              Ref #
            </div>
          </TableHead>
          <TableHead>
            <div className="text-right text- font-semibold uppercase">
              Debit
            </div>
          </TableHead>
          <TableHead>
            <div className="text-right pr-4 text- font-semibold uppercase">
              Credit
            </div>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {flatData.map((item, idx) => (
          <Fragment key={`${item.entryId}-${idx}`}>
            {item.showHeader && (
              <TableRow className="bg-muted/40 border-y">
                <TableCell
                  colSpan={6}
                  className="py-1.5 pl-4 text-xs font-semibold"
                >
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-amber-500" />
                    {item.formattedDate}
                  </div>
                </TableCell>
              </TableRow>
            )}
            <TableRow
              className={`${item.groupIdx % 2 === 0 ? "bg-muted/10" : ""} hover:bg-muted/20 border-b-0`}
            >
              {/* No. Transaksi */}
              <TableCell className="py-2.5 text-xs h-10">
                {item.isFirstLine && (
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-amber-500">
                      {item.transactionNumber}
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="text-xs">
                          <div>
                            Dibuat: {formatDateTimeDisplay(item.createdAt)}
                          </div>
                          {item.updatedAt && (
                            <div>
                              Diubah: {formatDateTimeDisplay(item.updatedAt)}
                            </div>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {editMode && (
                      <div className="inline-flex gap-1 ml-auto">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                        >
                          <Link to="/journal-entry" search={{ id: item.entryId }}>
                            <Pencil className="h-3 w-3" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => onPromptDelete(item.originalEntry)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </TableCell>

              {/* Account */}
              <TableCell className="py-2.5 text-xs h-10">
                <div
                  className={
                    item.debit > 0
                      ? "font-semibold"
                      : "pl-6 text-muted-foreground"
                  }
                >
                  {item.accountName ?? ""}
                </div>
              </TableCell>

              {/* Description */}
              <TableCell className="py-2.5 text-xs h-10">
                {item.lineDescription || "-"}
              </TableCell>

              {/* Ref # */}
              <TableCell className="py-2.5 text-xs h-10">
                <Badge
                  variant="outline"
                  className="font-mono text-xs text-amber-500"
                >
                  {String(item.referenceNumber ?? "-")}
                </Badge>
              </TableCell>

              {/* Debit */}
              <TableCell className="py-2.5 text-xs h-10">
                <div className="text-right font-mono text-emerald-500">
                  {Number(item.debit || 0) > 0
                    ? formatNumber(Number(item.debit))
                    : "-"}
                </div>
              </TableCell>

              {/* Credit */}
              <TableCell className="py-2.5 text-xs h-10">
                <div className="text-right pr-4 font-mono text-red-500">
                  {Number(item.credit || 0) > 0
                    ? formatNumber(Number(item.credit))
                    : "-"}
                </div>
              </TableCell>
            </TableRow>
          </Fragment>
        ))}
      </TableBody>
    </Table>
  );
}
