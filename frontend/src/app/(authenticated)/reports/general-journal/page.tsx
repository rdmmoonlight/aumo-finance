"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import {
  useGetApiV1ReportsJournalsGeneralQuery,
  useDeleteApiV1JournalEntryDeleteByIdMutation,
} from "@/lib/generatedApi";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Book,
  Plus,
  Pencil,
  Trash2,
  EyeOff,
  BookX,
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react";

export interface Account {
  id: number;
  referenceNumber: number;
  accountName: string;
}

export interface JournalLine {
  id: number;
  lineOrder: number;
  debit: number;
  credit: number;
  lineDescription?: string;
  accountName?: string;
  referenceNumber?: number;
  account?: Account;
}

export interface JournalEntry {
  id: number;
  transactionNumber: string;
  entryDate: string;
  createdAt: string;
  updatedAt?: string;
  lines: JournalLine[];
}

export interface FlatJournalRow {
  entryId: number;
  transactionNumber: string;
  entryDate: string;
  createdAt: string;
  updatedAt?: string;
  lineId: number;
  lineOrder: number;
  debit: number;
  credit: number;
  lineDescription?: string;
  accountName: string;
  referenceNumber: string | number;
  isFirstLine: boolean;
  showHeader: boolean;
  formattedDate: string;
  groupIdx: number;
  originalEntry: JournalEntry;
}

const formatNumber = (n: number) =>
  new Intl.NumberFormat("id-ID").format(Math.abs(n));

const formatDateDisplay = (s: string) =>
  !s
    ? "-"
    : new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(s));

const formatDateTimeDisplay = (s?: string) => {
  if (!s) return null;
  const d = new Date(s);
  const dateStr = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${dateStr}, ${hours}:${minutes}`;
};

export default function GeneralJournalClient() {
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<JournalEntry | null>(null);

  // Fetching data via RTK Query Hook
  const {
    data: responseData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetApiV1ReportsJournalsGeneralQuery();

  // Mutation Hook delete journal
  const [deleteJournalEntry, { isLoading: isDeleting }] =
    useDeleteApiV1JournalEntryDeleteByIdMutation();

  const data = responseData as any;
  const selectedPeriodName = data?.selectedPeriodName || null;
  const isPeriodClosed = data?.isPeriodClosed || false;
  const entries: JournalEntry[] = data?.entries || [];

  useEffect(() => {
    const handlePeriodChange = () => refetch();
    window.addEventListener("periodChanged", handlePeriodChange);
    return () =>
      window.removeEventListener("periodChanged", handlePeriodChange);
  }, [refetch]);

  useEffect(() => {
    if (isError && error && "status" in error && error.status === 401) {
      router.push("/");
    } else if (isError && error) {
      const msg =
        (error as any)?.data?.message || "Gagal mengambil data jurnal umum.";
      setErrorMessage(msg);
    }
  }, [isError, error, router]);

  const handlePromptDelete = (entry: JournalEntry) => {
    if (isPeriodClosed) {
      setErrorMessage(
        `Jurnal ${entry.transactionNumber} tidak dapat dihapus karena berada di periode yang telah ditutup.`
      );
      return;
    }
    setEntryToDelete(entry);
  };

  const handleDeleteConfirm = async () => {
    if (!entryToDelete) return;
    try {
      await deleteJournalEntry({ id: entryToDelete.id }).unwrap();
      refetch();
    } catch (err: any) {
      setErrorMessage(
        err?.data?.message || err?.message || "Gagal menghapus entri jurnal."
      );
    } finally {
      setEntryToDelete(null);
    }
  };

  // Menjadikan baris nested jurnal menjadi data datar (flat) untuk TanStack Table
  const flatData = useMemo<FlatJournalRow[]>(() => {
    let currentDateTracker = "";
    let groupIdx = 0;
    const rows: FlatJournalRow[] = [];

    entries.forEach((entry) => {
      const sorted = [...(entry.lines || [])].sort(
        (a, b) => a.lineOrder - b.lineOrder
      );
      const curDate = formatDateDisplay(entry.entryDate);
      const showHeader = curDate !== currentDateTracker;
      if (showHeader) {
        currentDateTracker = curDate;
        groupIdx++;
      }

      sorted.forEach((line, index) => {
        rows.push({
          entryId: entry.id,
          transactionNumber: entry.transactionNumber,
          entryDate: entry.entryDate,
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt,
          lineId: line.id || index,
          lineOrder: line.lineOrder,
          debit: line.debit,
          credit: line.credit,
          lineDescription: line.lineDescription,
          accountName:
            line.accountName || line.account?.accountName || "Unknown",
          referenceNumber:
            line.referenceNumber || line.account?.referenceNumber || "-",
          isFirstLine: index === 0,
          showHeader: index === 0 && showHeader,
          formattedDate: curDate,
          groupIdx,
          originalEntry: entry,
        });
      });
    });

    return rows;
  }, [entries]);

  // TanStack Table Column Definitions
  const columns = useMemo<ColumnDef<FlatJournalRow>[]>(
    () => [
      {
        id: "dateAndRef",
        header: () => <span className="pl-6">Date & Ref</span>,
        meta: { headerClassName: "w-[16%] pl-6", cellClassName: "align-top py-2 text-xs pl-6" },
        cell: ({ row }) => {
          const item = row.original;
          return (
            <>
              {item.showHeader && (
                <Badge variant="secondary" className="mb-1 font-mono">
                  {item.formattedDate}
                </Badge>
              )}
              {item.isFirstLine && (
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono font-bold text-amber-500">
                    {item.transactionNumber}
                  </span>
                  {item.createdAt && (
                    <span className="text-xs text-muted-foreground">
                      {formatDateTimeDisplay(item.createdAt)}
                    </span>
                  )}
                  {item.updatedAt && (
                    <span className="flex items-center gap-0.5 text-xs text-sky-500">
                      <Pencil className="h-2.5 w-2.5" />{" "}
                      {formatDateTimeDisplay(item.updatedAt)}
                    </span>
                  )}
                  {editMode && (
                    <div className="mt-1 flex gap-1">
                      <Button
                        asChild
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                      >
                        <Link href={`/journal-entry?id=${item.entryId}`}>
                          <Pencil className="h-3 w-3" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => handlePromptDelete(item.originalEntry)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </>
          );
        },
      },
      {
        accessorKey: "accountName",
        header: "Account",
        meta: { headerClassName: "w-[26%]" },
        cell: ({ row, getValue }) => {
          const isDebit = row.original.debit > 0;
          return (
            <div
              className={
                isDebit
                  ? "align-top py-2 text-xs font-semibold"
                  : "align-top py-2 pl-6 text-xs text-muted-foreground"
              }
            >
              {String(getValue() ?? "")}
            </div>
          );
        },
      },
      {
        accessorKey: "lineDescription",
        header: "Description",
        meta: { headerClassName: "w-[26%]", cellClassName: "align-top py-2 text-xs text-muted-foreground" },
        cell: ({ getValue }) => String(getValue() || "-"),
      },
      {
        accessorKey: "referenceNumber",
        header: () => <div className="text-center">Ref #</div>,
        meta: { headerClassName: "w-[10%] text-center", cellClassName: "align-top py-2 text-xs text-center" },
        cell: ({ getValue }) => (
          <Badge variant="outline" className="font-mono text-amber-500">
            {String(getValue())}
          </Badge>
        ),
      },
      {
        accessorKey: "debit",
        header: () => <div className="text-right">Debit (Rp)</div>,
        meta: {
          headerClassName: "w-[11%] text-right",
          cellClassName: "align-top py-2 text-right font-mono text-xs font-medium text-emerald-500",
        },
        cell: ({ getValue }) => {
          const val = Number(getValue() || 0);
          return val > 0 ? formatNumber(val) : "-";
        },
      },
      {
        accessorKey: "credit",
        header: () => <div className="text-right pr-6">Credit (Rp)</div>,
        meta: {
          headerClassName: "w-[11%] pr-6 text-right",
          cellClassName: "align-top py-2 pr-6 text-right font-mono text-xs font-medium text-red-500",
        },
        cell: ({ getValue }) => {
          const val = Number(getValue() || 0);
          return val > 0 ? formatNumber(val) : "-";
        },
      },
    ],
    [editMode, isDeleting]
  );

  const table = useReactTable({
    data: flatData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="max-w-5xl space-y-6 w-full">
      {errorMessage && (
        <Alert
          variant="destructive"
          className="flex justify-between items-center py-2"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive-foreground hover:bg-destructive/20"
            onClick={() => setErrorMessage(null)}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </Alert>
      )}

      <div className="flex flex-wrap sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold">
            <Book className="h-5.5 w-5.5 text-amber-500" /> General Journal
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Chronological record{" "}
            {selectedPeriodName ? `(Viewing: ${selectedPeriodName})` : ""} • All
            amounts in IDR (Rp)
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" className="gap-1.5">
            <Link href="/journal-entry">
              <Plus className="h-3.5 w-3.5" /> Add Entry
            </Link>
          </Button>
          <Button
            variant={editMode ? "secondary" : "outline"}
            size="sm"
            className="gap-1.5"
            onClick={() => setEditMode((p) => !p)}
            disabled={!entries.length}
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
        </div>
      </div>

      <Card className="w-full">
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[650px]">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const meta = header.column.columnDef.meta as
                        | { headerClassName?: string }
                        | undefined;
                      return (
                        <TableHead
                          key={header.id}
                          className={meta?.headerClassName}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-10 text-center text-muted-foreground"
                    >
                      <Loader2 className="animate-spin inline mr-2 h-4 w-4" />{" "}
                      Loading general journal...
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => {
                    const groupIdx = row.original.groupIdx;
                    const shade =
                      groupIdx % 2 === 0 ? "bg-muted/20" : "bg-transparent";

                    return (
                      <TableRow key={row.id} className={shade}>
                        {row.getVisibleCells().map((cell) => {
                          const meta = cell.column.columnDef.meta as
                            | { cellClassName?: string }
                            | undefined;
                          return (
                            <TableCell
                              key={cell.id}
                              className={meta?.cellClassName}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        {selectedPeriodName === null ? (
                          <>
                            <EyeOff className="h-7 w-7" />
                            <p className="text-sm font-medium">
                              No Period Selected
                            </p>
                            <p className="text-xs">
                              Go to{" "}
                              <Link
                                href="/periods"
                                className="text-primary underline"
                              >
                                Periods
                              </Link>
                            </p>
                          </>
                        ) : (
                          <>
                            <BookX className="h-7 w-7" />
                            <p className="text-sm font-medium">
                              No Entries Found
                            </p>
                            <p className="text-xs">
                              No entries in{" "}
                              <strong>{selectedPeriodName}</strong>
                            </p>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog
        open={!!entryToDelete}
        onOpenChange={(open) => !open && setEntryToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Journal Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete entry &quot;
              {entryToDelete?.transactionNumber}&quot;? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
  }
  
