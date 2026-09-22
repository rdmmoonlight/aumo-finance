"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  IconBook,
  IconPlus,
  IconPencil,
  IconTrash,
  IconEyeOff,
  IconBookOff,
  IconAlertTriangle,
  IconLoader2,
  IconX,
} from "@tabler/icons-react";

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

  // 1. Fetching data menggunakan Hook RTK Query
  const {
    data: responseData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetApiV1ReportsJournalsGeneralQuery();

  // 2. Mutation Hook untuk hapus jurnal
  const [deleteJournalEntry, { isLoading: isDeleting }] =
    useDeleteApiV1JournalEntryDeleteByIdMutation();

  // Casting data dari response API RTK
  const data = responseData as any;
  const selectedPeriodName = data?.selectedPeriodName || null;
  const isPeriodClosed = data?.isPeriodClosed || false;
  const entries: JournalEntry[] = data?.entries || [];

  // Re-fetch jika ada event kustom perubahan periode
  useEffect(() => {
    const handlePeriodChange = () => refetch();
    window.addEventListener("periodChanged", handlePeriodChange);
    return () =>
      window.removeEventListener("periodChanged", handlePeriodChange);
  }, [refetch]);

  // Handle 401 Unauthorized secara terpusat
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
        `Jurnal ${entry.transactionNumber} tidak dapat dihapus karena berada di periode yang telah ditutup.`,
      );
      return;
    }
    setEntryToDelete(entry);
  };

  const handleDeleteConfirm = async () => {
    if (!entryToDelete) return;
    try {
      await deleteJournalEntry({ id: entryToDelete.id }).unwrap();
      refetch(); // Trigger re-fetch otomatis untuk memperbarui cache
    } catch (err: any) {
      setErrorMessage(
        err?.data?.message || err?.message || "Gagal menghapus entri jurnal.",
      );
    } finally {
      setEntryToDelete(null);
    }
  };

  let currentDateTracker = "";
  let groupIdx = 0;

  return (
    <div className="max-w-5xl space-y-6 w-full">
      {errorMessage && (
        <Alert
          variant="destructive"
          className="flex justify-between items-center py-2"
        >
          <div className="flex items-center gap-2">
            <IconAlertTriangle size={16} />
            <AlertDescription>{errorMessage}</AlertDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive-foreground hover:bg-destructive/20"
            onClick={() => setErrorMessage(null)}
          >
            <IconX size={14} />
          </Button>
        </Alert>
      )}

      <div className="flex flex-wrap sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold">
            <IconBook className="text-amber-500" size={22} /> General Journal
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
              <IconPlus size={14} /> Add Entry
            </Link>
          </Button>
          <Button
            variant={editMode ? "secondary" : "outline"}
            size="sm"
            className="gap-1.5"
            onClick={() => setEditMode((p) => !p)}
            disabled={!entries.length}
          >
            <IconPencil size={14} /> Edit
          </Button>
        </div>
      </div>

      <Card className="w-full">
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[650px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[16%] pl-6">Date & Ref</TableHead>
                  <TableHead className="w-[26%]">Account</TableHead>
                  <TableHead className="w-[26%]">Description</TableHead>
                  <TableHead className="w-[10%] text-center">Ref #</TableHead>
                  <TableHead className="w-[11%] text-right">
                    Debit (Rp)
                  </TableHead>
                  <TableHead className="w-[11%] pr-6 text-right">
                    Credit (Rp)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-10 text-center text-muted-foreground"
                    >
                      <IconLoader2
                        className="animate-spin inline mr-2"
                        size={16}
                      />{" "}
                      Loading general journal...
                    </TableCell>
                  </TableRow>
                ) : entries.length > 0 ? (
                  entries.map((entry) => {
                    const sorted = [...(entry.lines || [])].sort(
                      (a, b) => a.lineOrder - b.lineOrder,
                    );
                    const curDate = formatDateDisplay(entry.entryDate);
                    const showHeader = curDate !== currentDateTracker;
                    if (showHeader) {
                      currentDateTracker = curDate;
                      groupIdx++;
                    }
                    const shade =
                      groupIdx % 2 === 0 ? "bg-muted/20" : "bg-transparent";

                    return sorted.map((line, i) => {
                      const isFirst = i === 0;
                      const isDebit = line.debit > 0;
                      const accName =
                        line.accountName ||
                        line.account?.accountName ||
                        "Unknown";
                      const ref =
                        line.referenceNumber ||
                        line.account?.referenceNumber ||
                        "-";

                      return (
                        <TableRow
                          key={`${entry.id}-${line.id || i}`}
                          className={shade}
                        >
                          <TableCell className="align-top py-2 text-xs pl-6">
                            {isFirst && showHeader && (
                              <Badge
                                variant="secondary"
                                className="mb-1 font-mono"
                              >
                                {curDate}
                              </Badge>
                            )}
                            {isFirst && (
                              <div className="flex flex-col gap-0.5">
                                <span className="font-mono font-bold text-amber-500">
                                  {entry.transactionNumber}
                                </span>
                                {entry.createdAt && (
                                  <span className="text-xs text-muted-foreground">
                                    {formatDateTimeDisplay(entry.createdAt)}
                                  </span>
                                )}
                                {entry.updatedAt && (
                                  <span className="flex items-center gap-0.5 text-xs text-sky-500">
                                    <IconPencil size={10} />{" "}
                                    {formatDateTimeDisplay(entry.updatedAt)}
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
                                      <Link
                                        href={`/journal-entry?id=${entry.id}`}
                                      >
                                        <IconPencil size={12} />
                                      </Link>
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-6 w-6 text-destructive hover:text-destructive"
                                      onClick={() => handlePromptDelete(entry)}
                                      disabled={isDeleting}
                                    >
                                      <IconTrash size={12} />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell
                            className={
                              isDebit
                                ? "align-top py-2 text-xs font-semibold"
                                : "align-top py-2 pl-6 text-xs text-muted-foreground"
                            }
                          >
                            {accName}
                          </TableCell>
                          <TableCell className="align-top py-2 text-xs text-muted-foreground">
                            {line.lineDescription || "-"}
                          </TableCell>
                          <TableCell className="align-top py-2 text-xs text-center">
                            <Badge
                              variant="outline"
                              className="font-mono text-amber-500"
                            >
                              {ref}
                            </Badge>
                          </TableCell>
                          <TableCell className="align-top py-2 text-right font-mono text-xs font-medium text-emerald-500">
                            {line.debit > 0 ? formatNumber(line.debit) : "-"}
                          </TableCell>
                          <TableCell className="align-top py-2 pr-6 text-right font-mono text-xs font-medium text-red-500">
                            {line.credit > 0 ? formatNumber(line.credit) : "-"}
                          </TableCell>
                        </TableRow>
                      );
                    });
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        {selectedPeriodName === null ? (
                          <>
                            <IconEyeOff size={28} />
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
                            <IconBookOff size={28} />
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
