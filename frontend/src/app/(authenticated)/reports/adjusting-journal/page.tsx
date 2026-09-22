"use client";

import Link from "next/link";
import { useState } from "react";
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
  IconAdjustments,
  IconPlus,
  IconPencil,
  IconTrash,
  IconEyeOff,
  IconFileX,
  IconLoader2,
  IconAlertTriangle,
} from "@tabler/icons-react";

// Import Hooks & Types dari auto-generated RTK Query
import {
  useGetApiV1ReportsJournalsAdjustingQuery,
  useDeleteApiV1ReportsJournalsAdjustingByIdMutation,
} from "@/lib/generatedApi";

// Format Helpers
const formatNumber = (n: number) =>
  new Intl.NumberFormat("id-ID").format(Math.abs(n));

const formatDateDisplay = (s?: string) =>
  !s
    ? "-"
    : new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(s));

const formatDateTimeDisplay = (s?: string) =>
  !s
    ? null
    : new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(s));

export default function AdjustingJournalPage() {
  const [editMode, setEditMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. RTK Query Fetching Data Jurnal Penyesuaian
  const {
    data: rawResponse,
    isLoading,
    isError,
    error,
  } = useGetApiV1ReportsJournalsAdjustingQuery();

  // 2. RTK Query Mutation Hapus Entri
  const [deleteJournalEntry, { isLoading: isDeleting }] =
    useDeleteApiV1ReportsJournalsAdjustingByIdMutation();

  // Mapping Response Data dari Backend
  const responseData = rawResponse as any;
  const selectedPeriodName = responseData?.selectedPeriodName || null;
  const isPeriodClosed = responseData?.isPeriodClosed || false;
  const entries: any[] = responseData?.entries || [];

  // Action Hapus Entri Jurnal
  const handleDeleteEntry = async (entry: any) => {
    if (isPeriodClosed) {
      alert(`${entry.transactionNumber} berada di periode yang sudah ditutup.`);
      return;
    }

    if (!confirm(`Hapus entri ${entry.transactionNumber}?`)) return;

    setErrorMessage(null);
    try {
      await deleteJournalEntry({ id: entry.id }).unwrap();
    } catch (err: any) {
      setErrorMessage(
        err?.data?.message || err?.message || "Gagal menghapus entri jurnal.",
      );
    }
  };

  let currentDateTracker = "";
  let groupIdx = 0;

  return (
    <div className="max-w-5xl space-y-6 w-full">
      {/* Alert Error dari Fetching atau Deleting */}
      {(errorMessage || isError) && (
        <Alert variant="destructive">
          <IconAlertTriangle size={16} />
          <AlertDescription>
            {errorMessage ||
              (error as any)?.data?.message ||
              "Gagal memuat laporan Jurnal Penyesuaian."}
          </AlertDescription>
        </Alert>
      )}

      {/* Header Bar */}
      <div className="flex flex-wrap sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold">
            <IconAdjustments className="text-amber-500" size={22} /> Adjusting
            Journal
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Menyelaraskan pendapatan & beban{" "}
            {selectedPeriodName
              ? `(Melihat Periode: ${selectedPeriodName})`
              : ""}
          </p>
        </div>

        <div className="flex gap-2">
          <Button asChild size="sm" className="gap-1.5">
            <Link href="/adjusting-journal-entry">
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

      {/* Table Card */}
      <Card className="w-full">
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[650px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[16%] pl-6">Tanggal & Ref</TableHead>
                  <TableHead className="w-[26%]">Akun</TableHead>
                  <TableHead className="w-[26%]">Keterangan</TableHead>
                  <TableHead className="w-[10%] text-center">Ref #</TableHead>
                  <TableHead className="w-[11%] text-right">Debit</TableHead>
                  <TableHead className="w-[11%] pr-6 text-right">
                    Kredit
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
                        className="mr-2 inline animate-spin"
                        size={16}
                      />{" "}
                      Memuat data Jurnal Penyesuaian...
                    </TableCell>
                  </TableRow>
                ) : entries.length > 0 ? (
                  entries.map((entry) => {
                    const sortedLines = [...(entry.lines || [])].sort(
                      (a: any, b: any) =>
                        (a.lineOrder || 0) - (b.lineOrder || 0),
                    );

                    const curDate = formatDateDisplay(entry.entryDate);
                    const showHeader = curDate !== currentDateTracker;

                    if (showHeader) {
                      currentDateTracker = curDate;
                      groupIdx++;
                    }

                    const shade = groupIdx % 2 === 0 ? "bg-muted/20" : "";

                    return sortedLines.map((line: any, i: number) => {
                      const isFirst = i === 0;
                      const debitNum = Number(line.debit || 0);
                      const creditNum = Number(line.credit || 0);
                      const isDebit = debitNum > 0;

                      const accName =
                        line.accountName ||
                        line.account?.accountName ||
                        "Tidak Diketahui";
                      const refNumber =
                        line.referenceNumber ||
                        line.account?.referenceNumber ||
                        "-";

                      return (
                        <TableRow
                          key={`${entry.id}-${line.id || i}`}
                          className={shade}
                        >
                          <TableCell className="align-top py-2 pl-6 text-xs">
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
                                        href={`/adjusting-journal-entry?id=${entry.id}`}
                                      >
                                        <IconPencil size={12} />
                                      </Link>
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-6 w-6 text-destructive"
                                      onClick={() => handleDeleteEntry(entry)}
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
                            className={`align-top py-2 text-xs ${
                              isDebit
                                ? "font-semibold"
                                : "pl-6 text-muted-foreground"
                            }`}
                          >
                            {accName}
                          </TableCell>

                          <TableCell className="align-top py-2 text-xs text-muted-foreground">
                            {line.lineDescription || "-"}
                          </TableCell>

                          <TableCell className="align-top py-2 text-center">
                            <Badge
                              variant="outline"
                              className="font-mono text-amber-500"
                            >
                              {refNumber}
                            </Badge>
                          </TableCell>

                          <TableCell className="align-top py-2 text-right font-mono text-xs font-medium text-emerald-500">
                            {debitNum > 0 ? formatNumber(debitNum) : "-"}
                          </TableCell>

                          <TableCell className="align-top py-2 pr-6 text-right font-mono text-xs font-medium text-red-500">
                            {creditNum > 0 ? formatNumber(creditNum) : "-"}
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
                              Belum Ada Periode Dipilih
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Buka halaman{" "}
                              <Link
                                href="/periods"
                                className="text-primary underline"
                              >
                                Periode
                              </Link>{" "}
                              untuk memilih salah satu.
                            </p>
                          </>
                        ) : (
                          <>
                            <IconFileX size={28} />
                            <p className="text-sm font-medium">
                              Belum Ada Jurnal Penyesuaian
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Tidak ada entri jurnal pada periode{" "}
                              <strong>{selectedPeriodName}</strong>.
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
    </div>
  );
}
