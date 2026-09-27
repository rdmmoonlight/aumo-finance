"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
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
  useGetApiV1ChartOfAccountsQuery,
  useGetApiV1JournalEntryNextTransactionNumberQuery,
  useGetApiV1JournalEntryByIdQuery,
  usePostApiV1JournalEntryCreateMutation,
  usePutApiV1JournalEntryEditByIdMutation,
} from "@/lib/generatedApi";
import { Edit, BookOpen, ArrowLeft, CheckCircle2, AlertTriangle, Lock, Plus, Trash2, Save, Loader2 } from "lucide-react";

export interface LineItem {
  id: string;
  accountId: number;
  lineDescription: string;
  debit: string;
  credit: string;
}

type AccountOption = {
  id: number;
  referenceNumber: number | string;
  accountName: string;
  [key: string]: any;
};

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

const columnHelper = createColumnHelper<LineItem>();

function JournalEntryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const entryIdParam = searchParams.get("id");
  const isEdit = Boolean(entryIdParam);
  const entryId = entryIdParam ? parseInt(entryIdParam, 10) : 0;

  // Form States
  const [journalType, setJournalType] = useState("General");
  const [entryDate, setEntryDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [lines, setLines] = useState<LineItem[]>([
    { id: "1", accountId: 0, lineDescription: "", debit: "", credit: "" },
    { id: "2", accountId: 0, lineDescription: "", debit: "", credit: "" },
  ]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // 1. RTK Query Hooks Integration
  const { data: rawAccountsData, isLoading: isAccountsLoading } =
    useGetApiV1ChartOfAccountsQuery({});

  const availableAccounts = useMemo<AccountOption[]>(() => {
    if (!rawAccountsData) return [];
    let list: any[] = [];
    if (typeof rawAccountsData === "object") {
      const res = rawAccountsData as any;
      if (Array.isArray(res.accounts)) list = res.accounts;
      else if (Array.isArray(res.data)) list = res.data;
      else if (Array.isArray(rawAccountsData)) list = rawAccountsData;
    }
    return list.map((a) => ({
      ...a,
      id: Number(a.id || 0),
      referenceNumber: a.referenceNumber ?? "",
      accountName: a.accountName ?? "",
    }));
  }, [rawAccountsData]);

  const { data: rawNextTxNumber, isFetching: isTxLoading } =
    useGetApiV1JournalEntryNextTransactionNumberQuery(
      { journalType, entryDate },
      { skip: isEdit },
    );

  const { data: editDataResponse, isLoading: isEditLoading } =
    useGetApiV1JournalEntryByIdQuery(
      { id: entryId },
      { skip: !isEdit || isNaN(entryId) },
    );

  const [createJournalEntry, { isLoading: isCreating }] =
    usePostApiV1JournalEntryCreateMutation();
  const [updateJournalEntry, { isLoading: isUpdating }] =
    usePutApiV1JournalEntryEditByIdMutation();

  const isSubmitting = isCreating || isUpdating;
  const editData = (editDataResponse as any) || null;

  useEffect(() => {
    if (isEdit && editData) {
      const jData = editData.entry || editData.data || editData;
      if (jData && typeof jData === "object") {
        if (jData.journalType) setJournalType(jData.journalType);
        if (jData.entryDate) setEntryDate(jData.entryDate.split("T")[0]);

        if (Array.isArray(jData.lines) && jData.lines.length > 0) {
          setLines(
            jData.lines.map((l: any, i: number) => ({
              id: l.id?.toString() || `${Date.now()}-${i}`,
              accountId: Number(l.accountId || 0),
              lineDescription: l.lineDescription || "",
              debit: l.debit > 0 ? formatNumberWithDots(l.debit) : "",
              credit: l.credit > 0 ? formatNumberWithDots(l.credit) : "",
            })),
          );
        }
      }
    }
  }, [isEdit, editData]);

  const displayedTxNumber = useMemo(() => {
    if (isEdit) {
      const jData = editData?.entry || editData?.data || editData;
      return jData?.transactionNumber || "Loading...";
    }
    if (rawNextTxNumber) {
      if (typeof rawNextTxNumber === "string") return rawNextTxNumber;
      if (typeof rawNextTxNumber === "object") {
        return (
          (rawNextTxNumber as any).transactionNumber ||
          (rawNextTxNumber as any).nextTransactionNumber ||
          (rawNextTxNumber as any).data ||
          "Loading..."
        );
      }
    }
    return "Loading...";
  }, [isEdit, editData, rawNextTxNumber]);

  const isLocked = Boolean(
    isEdit && (editData?.isLocked || editData?.entry?.isLocked),
  );

  const totalDebit = useMemo(
    () => lines.reduce((s, l) => s + parseFormattedNumber(l.debit), 0),
    [lines],
  );
  const totalCredit = useMemo(
    () => lines.reduce((s, l) => s + parseFormattedNumber(l.credit), 0),
    [lines],
  );
  const isBalanced = useMemo(
    () => totalDebit > 0 && totalDebit === totalCredit,
    [totalDebit, totalCredit],
  );

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
      }),
    );
  };

  // TanStack Table Column Definitions
  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.accountId, {
        id: "referenceNumber",
        header: () => (
          /* Label kecil (11px) */
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Ref
          </span>
        ),
        cell: ({ row }) => {
          const ref = availableAccounts.find(
            (a) => a.id === row.original.accountId,
          )?.referenceNumber;
          return (
            /* Caption (12px) */
            <Input
              className="h-8 text-center text-xs bg-muted font-mono"
              readOnly
              value={ref || ""}
              placeholder="---"
            />
          );
        },
      }),
      columnHelper.accessor("accountId", {
        header: () => (
          /* Label kecil (11px) */
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Account
          </span>
        ),
        cell: ({ row }) => (
          <Select
            value={row.original.accountId ? String(row.original.accountId) : ""}
            onValueChange={(v) =>
              updateLine(row.original.id, "accountId", Number(v))
            }
          >
            {/* Caption (12px) */}
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select Account" />
            </SelectTrigger>
            {/* Caption (12px) */}
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
        ),
      }),
      columnHelper.accessor("lineDescription", {
        header: () => (
          /* Label kecil (11px) */
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Description
          </span>
        ),
        cell: ({ row }) => (
          /* Caption (12px) */
          <Input
            className="h-8 text-xs"
            placeholder="Note..."
            value={row.original.lineDescription}
            onChange={(e) =>
              updateLine(row.original.id, "lineDescription", e.target.value)
            }
          />
        ),
      }),
      columnHelper.accessor("debit", {
        header: () => (
          /* Label kecil (11px) */
          <div className="text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Debit
          </div>
        ),
        cell: ({ row }) => (
          /* Caption (12px) */
          <Input
            className="h-8 text-xs text-right font-mono"
            placeholder="0"
            value={row.original.debit}
            onChange={(e) =>
              updateLine(row.original.id, "debit", e.target.value)
            }
          />
        ),
      }),
      columnHelper.accessor("credit", {
        header: () => (
          /* Label kecil (11px) */
          <div className="text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Credit
          </div>
        ),
        cell: ({ row }) => (
          /* Caption (12px) */
          <Input
            className="h-8 text-xs text-right font-mono"
            placeholder="0"
            value={row.original.credit}
            onChange={(e) =>
              updateLine(row.original.id, "credit", e.target.value)
            }
          />
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: () => (
          /* Label kecil (11px) */
          <div className="text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Action
          </div>
        ),
        cell: ({ row }) => (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => removeLine(row.original.id)}
          >
            <Trash2 size={14} />
          </Button>
        ),
      }),
    ],
    [availableAccounts],
  );

  // TanStack Table Instance
  const table = useReactTable({
    data: lines,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);
    setSuccessMessage(null);

    const effective = lines.filter(
      (l) =>
        l.accountId !== 0 &&
        (parseFormattedNumber(l.debit) > 0 ||
          parseFormattedNumber(l.credit) > 0),
    );

    if (effective.length < 2) {
      setValidationErrors(["Min 2 valid lines required"]);
      return;
    }
    if (!isBalanced) {
      setValidationErrors(["Debit must equal Credit"]);
      return;
    }

    try {
      if (isEdit) {
        const updatePayload = {
          id: entryId,
          updateJournalEntryRequest: {
            entryDate,
            journalType,
            transactionNumber: displayedTxNumber,
            lines: effective.map((l) => ({
              accountId: l.accountId,
              lineDescription: l.lineDescription,
              debit: parseFormattedNumber(l.debit),
              credit: parseFormattedNumber(l.credit),
            })),
          },
        };

        const res: any = await updateJournalEntry(updatePayload).unwrap();
        const txNum = res?.transactionNumber || displayedTxNumber;
        setSuccessMessage(`Updated ${txNum}`);
        setTimeout(() => router.push("/reports/general-journal"), 1200);
      } else {
        const createPayload = {
          createJournalEntryRequest: {
            journalType,
            entryDate,
            lines: effective.map((l) => ({
              accountId: l.accountId,
              lineDescription: l.lineDescription,
              debit: parseFormattedNumber(l.debit),
              credit: parseFormattedNumber(l.credit),
            })),
          },
        };

        const res: any = await createJournalEntry(createPayload).unwrap();
        const txNum =
          res?.transactionNumber ||
          res?.data?.transactionNumber ||
          displayedTxNumber;
        setSuccessMessage(`Posted ${txNum}`);
        resetForm();
      }
    } catch (err: any) {
      setValidationErrors([
        err?.data?.message || err?.message || "Failed to post journal entry",
      ]);
    }
  };

  if (isAccountsLoading || (isEdit && isEditLoading)) {
    return (
      <div className="flex flex-col items-center py-16 gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        {/* UI (14px) */}
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          {/* H2 (24px) */}
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            {isEdit ? (
              <Edit className="text-primary" />
            ) : (
              <BookOpen className="text-primary" />
            )}
            {isEdit ? "Edit Journal Entry" : "Create Journal Entry"}
            {isEdit && (
              /* Caption (12px) */
              <Badge variant="secondary" className="font-mono text-xs">
                {displayedTxNumber}
              </Badge>
            )}
          </h2>
          {/* UI (14px) */}
          <p className="text-sm text-muted-foreground mt-1">
            Record double-entry transactions
          </p>
        </div>
        {/* UI (14px) */}
        <Button variant="outline" size="sm" asChild className="text-sm">
          <Link href="/reports/general-journal" className="gap-1.5">
            <ArrowLeft size={14} /> Back to Journal
          </Link>
        </Button>
      </div>

      {successMessage && (
        <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-300">
          <CheckCircle2 size={16} />
          {/* Caption (12px) */}
          <AlertDescription className="text-xs">{successMessage}</AlertDescription>
        </Alert>
      )}

      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle size={16} />
          {/* Caption (12px) */}
          <AlertDescription className="text-xs">
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
          <Lock size={16} />
          {/* Caption (12px) */}
          <AlertDescription className="text-xs">
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
              {/* UI (14px) */}
              <CardTitle className="text-sm font-semibold">Transaction Info</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                {/* Caption (12px) */}
                <Label className="text-xs font-medium flex items-center justify-between">
                  <span>Transaction No.</span>
                  {isTxLoading && (
                    <Loader2
                      size={12}
                      className="animate-spin text-muted-foreground"
                    />
                  )}
                </Label>
                {/* UI (14px) */}
                <Input
                  className="h-9 font-mono bg-muted text-sm"
                  value={displayedTxNumber}
                  readOnly
                />
              </div>
              <div className="space-y-1.5">
                {/* Caption (12px) */}
                <Label className="text-xs font-medium">Journal Type</Label>
                <Select value={journalType} onValueChange={setJournalType}>
                  {/* UI (14px) */}
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  {/* UI (14px) */}
                  <SelectContent className="text-sm">
                    <SelectItem value="General">
                      General Journal (GJ)
                    </SelectItem>
                    <SelectItem value="Adjusting">
                      Adjusting Entry (AJ)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                {/* Caption (12px) */}
                <Label className="text-xs font-medium">Date</Label>
                {/* UI (14px) */}
                <Input
                  type="date"
                  className="h-9 text-sm"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="py-3 flex-row items-center justify-between space-y-0">
              {/* UI (14px) */}
              <CardTitle className="text-sm font-semibold">Journal Lines</CardTitle>
              {/* Caption (12px) */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={addLine}
              >
                <Plus size={12} /> Add Line
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        const styleClass =
                          header.id === "referenceNumber"
                            ? "w-[10%]"
                            : header.id === "accountId"
                            ? "w-[28%]"
                            : header.id === "debit" || header.id === "credit"
                            ? "text-right w-[15%]"
                            : header.id === "actions"
                            ? "w-[5%]"
                            : "";

                        return (
                          <TableHead key={header.id} className={styleClass}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    {/* Caption (12px) */}
                    <TableCell colSpan={3} className="text-right text-xs font-medium">
                      Total:
                    </TableCell>
                    {/* Caption (12px) */}
                    <TableCell className="text-right font-mono text-xs text-emerald-500">
                      Rp {formatIDR(totalDebit)}
                    </TableCell>
                    {/* Caption (12px) */}
                    <TableCell className="text-right font-mono text-xs text-red-500">
                      Rp {formatIDR(totalCredit)}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                  <TableRow>
                    {/* Caption (12px) */}
                    <TableCell colSpan={3} className="text-right text-xs">
                      Status:
                    </TableCell>
                    <TableCell colSpan={2} className="text-center">
                      {isBalanced ? (
                        /* Label kecil (11px) */
                        <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20 text-[11px] gap-1">
                          <CheckCircle2 size={12} /> Balanced
                        </Badge>
                      ) : (
                        /* Label kecil (11px) */
                        <Badge
                          variant="destructive"
                          className="gap-1 bg-red-500/15 text-red-500 border-red-500/20 text-[11px]"
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

          <div className="flex justify-end gap-2">
            {/* UI (14px) */}
            <Button type="button" variant="outline" onClick={resetForm} className="text-sm">
              Reset
            </Button>
            {/* UI (14px) */}
            <Button
              type="submit"
              disabled={!isBalanced || isSubmitting}
              className="gap-2 text-sm font-medium"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Save size={16} />
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
        /* Caption (12px) */
        <div className="py-16 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="animate-spin" size={16} /> Loading...
        </div>
      }
    >
      <JournalEntryContent />
    </Suspense>
  );
}
