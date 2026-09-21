"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  IconEdit,
  IconNotebook,
  IconArrowLeft,
  IconCircleCheck,
  IconAlertTriangle,
  IconLock,
  IconPlus,
  IconTrash,
  IconDeviceFloppy,
  IconLoader2,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  useAccountOptions,
  useNextTransactionNumber,
  useJournalEntryDetail,
  useSaveJournalEntry,
} from "@/hooks/use-journal-entry";

export interface LineItem {
  id: string;
  accountId: number;
  lineDescription: string;
  debit: string;
  credit: string;
}

const formatIDR = (amount: number) =>
  new Intl.NumberFormat("id-ID").format(amount);

const formatNumberWithDots = (val: string | number): string => {
  if (!val) return "";
  const clean = val.toString().replace(/\D/g, "");
  if (!clean) return "";
  return new Intl.NumberFormat("id-ID").format(parseInt(clean, 10));
};

const parseFormattedNumber = (val: string): number => {
  if (!val) return 0;
  const clean = val.replace(/\D/g, "");
  return clean ? parseInt(clean, 10) : 0;
};

function JournalEntryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const entryIdParam = searchParams.get("id");
  const isEdit = Boolean(entryIdParam);

  // Form States
  const [journalType, setJournalType] = useState("General");
  const [entryDate, setEntryDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [lines, setLines] = useState<LineItem[]>([
    { id: "1", accountId: 0, lineDescription: "", debit: "", credit: "" },
    { id: "2", accountId: 0, lineDescription: "", debit: "", credit: "" },
  ]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // 1. TanStack Query Hooks
  const { data: availableAccounts = [], isLoading: isAccountsLoading } =
    useAccountOptions();

  const { data: nextTxNumber, isFetching: isTxLoading } =
    useNextTransactionNumber(journalType, entryDate, !isEdit);

  const { data: editData, isLoading: isEditLoading } =
    useJournalEntryDetail(entryIdParam);
  const saveMutation = useSaveJournalEntry(entryIdParam);

  // Synchronize Form State saat data edit berhasil dimuat
  useEffect(() => {
    if (isEdit && editData?.entry) {
      const jData = editData.entry;
      setJournalType(jData.journalType || "General");
      setEntryDate(
        jData.entryDate?.split("T")[0] || new Date().toISOString().split("T")[0]
      );

      if (jData.lines?.length) {
        setLines(
          jData.lines.map((l: any, i: number) => ({
            id: l.id?.toString() || `${Date.now()}-${i}`,
            accountId: l.accountId,
            lineDescription: l.lineDescription || "",
            debit: l.debit > 0 ? formatNumberWithDots(l.debit) : "",
            credit: l.credit > 0 ? formatNumberWithDots(l.credit) : "",
          }))
        );
      }
    }
  }, [isEdit, editData]);

  // Nomor Transaksi yang ditampilkan
  const displayedTxNumber = isEdit
    ? editData?.entry?.transactionNumber || "Loading..."
    : nextTxNumber || "Loading...";

  const isLocked = isEdit && editData?.isLocked;

  // Calculators
  const totalDebit = useMemo(
    () => lines.reduce((s, l) => s + parseFormattedNumber(l.debit), 0),
    [lines]
  );
  const totalCredit = useMemo(
    () => lines.reduce((s, l) => s + parseFormattedNumber(l.credit), 0),
    [lines]
  );
  const isBalanced = useMemo(
    () => totalDebit > 0 && totalDebit === totalCredit,
    [totalDebit, totalCredit]
  );

  // Form Actions
  const addLine = () => {
    setValidationErrors([]);
    setLines((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        accountId: 0,
        lineDescription: "",
        debit: "",
        credit: "",
      },
    ]);
  };

  const removeLine = (id: string) => {
    if (lines.length <= 2) {
      setValidationErrors(["Minimal 2 baris jurnal wajib ada."]);
      return;
    }
    setValidationErrors([]);
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  const updateLine = (id: string, field: keyof LineItem, value: any) => {
    setLines((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        if (field === "debit" && value !== "")
          return { ...l, debit: formatNumberWithDots(value), credit: "" };
        if (field === "credit" && value !== "")
          return { ...l, credit: formatNumberWithDots(value), debit: "" };
        return { ...l, [field]: value };
      })
    );
  };

  const resetForm = () => {
    const defaultDate = new Date().toISOString().split("T")[0];
    setJournalType("General");
    setEntryDate(defaultDate);
    setLines([
      {
        id: Date.now() + "-1",
        accountId: 0,
        lineDescription: "",
        debit: "",
        credit: "",
      },
      {
        id: Date.now() + "-2",
        accountId: 0,
        lineDescription: "",
        debit: "",
        credit: "",
      },
    ]);
    setValidationErrors([]);
    setSuccessMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);
    setSuccessMessage(null);

    const effective = lines.filter(
      (l) =>
        l.accountId !== 0 &&
        (parseFormattedNumber(l.debit) > 0 || parseFormattedNumber(l.credit) > 0)
    );

    if (effective.length < 2) {
      setValidationErrors(["Min 2 valid lines required"]);
      return;
    }
    if (!isBalanced) {
      setValidationErrors(["Debit must equal Credit"]);
      return;
    }

    const payload = {
      journalType,
      entryDate,
      lines: effective.map((l) => ({
        accountId: l.accountId,
        lineDescription: l.lineDescription,
        debit: parseFormattedNumber(l.debit),
        credit: parseFormattedNumber(l.credit),
      })),
    };

    saveMutation.mutate(payload, {
      onSuccess: (res) => {
        const txNum = res?.transactionNumber || displayedTxNumber;
        if (isEdit) {
          setSuccessMessage(`Updated ${txNum}`);
          setTimeout(() => router.push("/reports/general-journal"), 1200);
        } else {
          setSuccessMessage(`Posted ${txNum}`);
          resetForm();
        }
      },
      onError: (err: any) => {
        setValidationErrors([
          err?.response?.data?.message || "Failed to post journal entry",
        ]);
      },
    });
  };

  if (isAccountsLoading || (isEdit && isEditLoading)) {
    return (
      <div className="flex flex-col items-center py-16 gap-3 text-muted-foreground">
        <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            {isEdit ? (
              <IconEdit className="text-primary" />
            ) : (
              <IconNotebook className="text-primary" />
            )}
            {isEdit ? "Edit Journal Entry" : "Create Journal Entry"}
            {isEdit && (
              <Badge variant="secondary" className="font-mono text-xs">
                {displayedTxNumber}
              </Badge>
            )}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Record double-entry transactions
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/reports/general-journal" className="gap-1.5">
            <IconArrowLeft size={14} /> Back to Journal
          </Link>
        </Button>
      </div>

      {successMessage && (
        <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-300">
          <IconCircleCheck size={16} />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <IconAlertTriangle size={16} />
          <AlertDescription>
            <ul className="list-disc ml-4">
              {validationErrors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {isLocked ? (
        <Alert>
          <IconLock size={16} />
          <AlertDescription>
            Journal {displayedTxNumber} is in closed period.{" "}
            <Link href="/reports/general-journal" className="underline">
              Back
            </Link>
          </AlertDescription>
        </Alert>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Transaction Info</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium flex items-center justify-between">
                  <span>Transaction No.</span>
                  {isTxLoading && (
                    <IconLoader2
                      size={12}
                      className="animate-spin text-muted-foreground"
                    />
                  )}
                </Label>
                <Input
                  className="h-9 font-mono bg-muted"
                  value={displayedTxNumber}
                  readOnly
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Journal Type</Label>
                <Select value={journalType} onValueChange={setJournalType}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General Journal (GJ)</SelectItem>
                    <SelectItem value="Adjusting">Adjusting Entry (AJ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Date</Label>
                <Input
                  type="date"
                  className="h-9"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="py-3 flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm">Journal Lines</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={addLine}
              >
                <IconPlus size={12} /> Add Line
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[10%]">Ref</TableHead>
                    <TableHead className="w-[28%]">Account</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right w-[15%]">Debit</TableHead>
                    <TableHead className="text-right w-[15%]">Credit</TableHead>
                    <TableHead className="w-[5%]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lines.map((line) => {
                    const ref = availableAccounts.find(
                      (a) => a.id === line.accountId
                    )?.referenceNumber;

                    return (
                      <TableRow key={line.id}>
                        <TableCell>
                          <Input
                            className="h-8 text-center text-xs bg-muted"
                            readOnly
                            value={ref || ""}
                            placeholder="---"
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={
                              line.accountId ? String(line.accountId) : ""
                            }
                            onValueChange={(v) =>
                              updateLine(line.id, "accountId", Number(v))
                            }
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select Account" />
                            </SelectTrigger>
                            <SelectContent>
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
                            value={line.lineDescription}
                            onChange={(e) =>
                              updateLine(
                                line.id,
                                "lineDescription",
                                e.target.value
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            className="h-8 text-xs text-right font-mono"
                            placeholder="0"
                            value={line.debit}
                            onChange={(e) =>
                              updateLine(line.id, "debit", e.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            className="h-8 text-xs text-right font-mono"
                            placeholder="0"
                            value={line.credit}
                            onChange={(e) =>
                              updateLine(line.id, "credit", e.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => removeLine(line.id)}
                          >
                            <IconTrash size={14} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-medium">
                      Total:
                    </TableCell>
                    <TableCell className="text-right font-mono text-emerald-500">
                      Rp {formatIDR(totalDebit)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-red-500">
                      Rp {formatIDR(totalCredit)}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={3} className="text-right">
                      Status:
                    </TableCell>
                    <TableCell colSpan={2} className="text-center">
                      {isBalanced ? (
                        <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20 gap-1">
                          <IconCircleCheck size={12} /> Balanced
                        </Badge>
                      ) : (
                        <Badge
                          variant="destructive"
                          className="gap-1 bg-red-500/15 text-red-500 border-red-500/20"
                        >
                          <IconAlertTriangle size={12} /> Unbalanced Rp{" "}
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

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={resetForm}>
              Reset
            </Button>
            <Button
              type="submit"
              disabled={!isBalanced || saveMutation.isPending}
              className="gap-2"
            >
              {saveMutation.isPending ? (
                <IconLoader2 className="animate-spin" size={16} />
              ) : (
                <IconDeviceFloppy size={16} />
              )}
              {isEdit ? "Save Changes" : "Post Journal Entry"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function JournalEntryPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
          <IconLoader2 className="animate-spin" size={16} /> Loading...
        </div>
      }
    >
      <JournalEntryContent />
    </Suspense>
  );
}