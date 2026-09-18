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
    <div className="aumo-page-container">
      {errorMessage && (
        <Alert variant="destructive">
          <IconAlertTriangle size={16} />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="aumo-page-header">
        <div>
          <h1 className="aumo-page-title">
            <IconBook className="aumo-text-amber" size={22} /> General Journal
          </h1>
          <p className="aumo-page-subtitle">
            Chronological record{" "}
            {selectedPeriodName ? `(Viewing: ${selectedPeriodName})` : ""} • All
            amounts in IDR (Rp)
          </p>
        </div>
        <div className="aumo-btn-group">
          <Button asChild size="sm" className="aumo-btn-icon-label">
            <Link href="/journal-entry">
              <IconPlus size={14} /> Add Entry
            </Link>
          </Button>
          <Button
            variant={editMode ? "secondary" : "outline"}
            size="sm"
            className="aumo-btn-icon-label"
            onClick={() => setEditMode((p) => !p)}
            disabled={!entries.length}
          >
            <IconPencil size={14} /> Edit
          </Button>
        </div>
      </div>

      <Card className="w-full">
        <CardContent className="p-0">
          <div className="aumo-table-container">
            <Table className="aumo-journal-table">
              <TableHeader>
                <TableRow>
                  <TableHead className="aumo-col-date-ref">
                    Date & Ref
                  </TableHead>
                  <TableHead className="aumo-col-account">Account</TableHead>
                  <TableHead className="aumo-col-desc">Description</TableHead>
                  <TableHead className="aumo-col-refno">Ref #</TableHead>
                  <TableHead className="aumo-col-debit">Debit (Rp)</TableHead>
                  <TableHead className="aumo-col-credit">Credit (Rp)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="aumo-table-loading">
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
                      groupIdx % 2 === 0
                        ? "aumo-row-shaded"
                        : "aumo-row-normal";

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
                          <TableCell className="aumo-table-cell-base pl-6">
                            {isFirst && showHeader && (
                              <Badge
                                variant="secondary"
                                className="aumo-badge-date"
                              >
                                {curDate}
                              </Badge>
                            )}
                            {isFirst && (
                              <div className="aumo-entry-info">
                                <span className="aumo-entry-tx-num">
                                  {entry.transactionNumber}
                                </span>
                                {entry.createdAt && (
                                  <span className="aumo-entry-created">
                                    {formatDateTimeDisplay(entry.createdAt)}
                                  </span>
                                )}
                                {entry.updatedAt && (
                                  <span className="aumo-entry-updated">
                                    <IconPencil size={10} />{" "}
                                    {formatDateTimeDisplay(entry.updatedAt)}
                                  </span>
                                )}
                                {editMode && (
                                  <div className="aumo-entry-actions">
                                    <Button
                                      asChild
                                      variant="outline"
                                      size="icon"
                                      className="aumo-btn-icon-xs"
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
                                      className="aumo-btn-icon-xs text-destructive"
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
                                ? "aumo-table-cell-debit"
                                : "aumo-table-cell-credit"
                            }
                          >
                            {accName}
                          </TableCell>
                          <TableCell className="aumo-table-cell-base text-muted-foreground">
                            {line.lineDescription || "-"}
                          </TableCell>
                          <TableCell className="aumo-table-cell-base text-center">
                            <Badge variant="outline" className="aumo-badge-ref">
                              {ref}
                            </Badge>
                          </TableCell>
                          <TableCell className="aumo-cell-debit-val">
                            {line.debit > 0 ? formatNumber(line.debit) : "-"}
                          </TableCell>
                          <TableCell className="aumo-cell-credit-val">
                            {line.credit > 0 ? formatNumber(line.credit) : "-"}
                          </TableCell>
                        </TableRow>
                      );
                    });
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="aumo-table-empty">
                      <div className="aumo-table-empty-box">
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
