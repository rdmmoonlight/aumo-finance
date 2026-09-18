"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";
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
  IconBook,
  IconPlus,
  IconPencil,
  IconTrash,
  IconEyeOff,
  IconBookOff,
  IconAlertTriangle,
  IconLoader2,
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
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedPeriodName, setSelectedPeriodName] = useState<string | null>(
    null,
  );
  const [isPeriodClosed, setIsPeriodClosed] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { data } = await apiClient.get("/api/v1/reports/journals/general");
      if (data.success) {
        setSelectedPeriodName(data.selectedPeriodName || null);
        setIsPeriodClosed(data.isPeriodClosed || false);
        setEntries(data.entries || []);
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push("/");
      }
      setErrorMessage(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
    const handlePeriodChange = () => fetchData();
    window.addEventListener("periodChanged", handlePeriodChange);
    return () =>
      window.removeEventListener("periodChanged", handlePeriodChange);
  }, [fetchData]);

  const deleteEntry = async (entry: JournalEntry) => {
    if (isPeriodClosed) {
      alert(`${entry.transactionNumber} in closed period`);
      return;
    }
    if (!confirm(`Delete ${entry.transactionNumber}?`)) return;
    try {
      await apiClient.delete(`/api/v1/reports/journals/general/${entry.id}`);
      setEntries((prev) => prev.filter((e) => e.id !== entry.id));
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || "Failed to delete entry");
    }
  };

  let currentDateTracker = "";
  let groupIdx = 0;

  return (
    <div className="max-w-5xl space-y-6 w-full">
      {errorMessage && (
        <Alert variant="destructive">
          <IconAlertTriangle size={16} />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold">
            <IconBook className="aumo-text-amber" size={22} /> General Journal
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
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-10 text-center text-muted-foreground"
                    >
                      <IconLoader2 className="aumo-spin-icon" size={16} />{" "}
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
                                      className="h-6 w-6 text-destructive"
                                      onClick={() => deleteEntry(entry)}
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
    </div>
  );
}
