"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  useGetApiV1JournalEntryNextTransactionNumberQuery,
  useGetApiV1JournalEntryByIdQuery,
  usePostApiV1JournalEntryCreateMutation,
  usePutApiV1JournalEntryEditByIdMutation,
} from "@/lib/store/(authenticated)/journal-entry/journalEntryApi";
import {
  useGetApiV1ChartOfAccountsQuery,
} from "#/lib/store/(authenticated)/chart-of-accounts/chartOfAccountsApi";
import {
  Edit,
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Plus,
  Trash2,
  Save,
  Loader2,
} from "lucide-react";

import {
  journalEntrySchema,
  parseFormattedNumber,
  type JournalEntryFormValues,
} from "@/lib/validations/journal-entry";
import { z } from "zod";

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

const columnHelper = createColumnHelper<LineItem>();

function JournalEntryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const entryIdParam = searchParams.get("id");
  const isEdit = Boolean(entryIdParam);
  const entryId = entryIdParam ? parseInt(entryIdParam, 10) : 0;

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // 1. Setup React Hook Form & Zod dengan penanganan Tipe Generic z.input & z.output
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<
    z.input<typeof journalEntrySchema>,
    any,
    z.output<typeof journalEntrySchema>
  >({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      journalType: "General",
      entryDate: new Date().toISOString().split("T")[0],
      lines: [
        { id: "1", accountId: 0, lineDescription: "", debit: "", credit: "" },
        { id: "2", accountId: 0, lineDescription: "", debit: "", credit: "" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  });

  const journalType = watch("journalType");
  const entryDate = watch("entryDate");
  const watchedLines = watch("lines");

  // 2. RTK Query Hooks Integration
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

  // Hydrate form pada mode Edit
  useEffect(() => {
    if (isEdit && editData) {
      const jData = editData.entry || editData.data || editData;
      if (jData && typeof jData === "object") {
        if (jData.journalType) setValue("journalType", jData.journalType);
        if (jData.entryDate)
          setValue("entryDate", jData.entryDate.split("T")[0]);

        if (Array.isArray(jData.lines) && jData.lines.length > 0) {
          setValue(
            "lines",
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
  }, [isEdit, editData, setValue]);

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

  // Kalkulasi Total Debit & Credit
  const totalDebit = useMemo(
    () =>
      (watchedLines || []).reduce(
        (s, l) => s + parseFormattedNumber(l?.debit || ""),
        0,
      ),
    [watchedLines],
  );
  const totalCredit = useMemo(
    () =>
      (watchedLines || []).reduce(
        (s, l) => s + parseFormattedNumber(l?.credit || ""),
        0,
      ),
    [watchedLines],
  );
  const isBalanced = useMemo(
    () => totalDebit > 0 && totalDebit === totalCredit,
    [totalDebit, totalCredit],
  );

  const addLine = () => {
    append({
      id: `${Date.now()}-${Math.random()}`,
      accountId: 0,
      lineDescription: "",
      debit: "",
      credit: "",
    });
  };

  const removeLine = (index: number) => {
    if (fields.length <= 2) {
      setApiError("Minimal 2 baris jurnal wajib ada.");
      return;
    }
    setApiError(null);
    remove(index);
  };

  const handleAmountChange = (
    index: number,
    field: "debit" | "credit",
    value: string,
  ) => {
    const formatted = formatNumberWithDots(value);
    setValue(`lines.${index}.${field}`, formatted, { shouldValidate: true });
    // Reset nilai yang berseberangan agar bersifat mutually exclusive
    const oppositeField = field === "debit" ? "credit" : "debit";
    if (value !== "") {
      setValue(`lines.${index}.${oppositeField}`, "", { shouldValidate: true });
    }
  };

  // TanStack Table Column Definitions
  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.accountId, {
        id: "referenceNumber",
        header: () => (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Ref
          </span>
        ),
        cell: ({ row }) => {
          const ref = availableAccounts.find(
            (a) => a.id === row.original.accountId,
          )?.referenceNumber;
          return (
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
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Account
          </span>
        ),
        cell: ({ row }) => {
          const index = row.index;
          const currentAccountId = watchedLines?.[index]?.accountId;
          return (
            <Select
              value={currentAccountId ? String(currentAccountId) : ""}
              onValueChange={(v) =>
                setValue(`lines.${index}.accountId`, Number(v), {
                  shouldValidate: true,
                })
              }
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
          );
        },
      }),
      columnHelper.accessor("lineDescription", {
        header: () => (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Description
          </span>
        ),
        cell: ({ row }) => {
          const index = row.index;
          return (
            <Input
              className="h-8 text-xs"
              placeholder="Note..."
              {...register(`lines.${index}.lineDescription`)}
            />
          );
        },
      }),
      columnHelper.accessor("debit", {
        header: () => (
          <div className="text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Debit
          </div>
        ),
        cell: ({ row }) => {
          const index = row.index;
          return (
            <Input
              className="h-8 text-xs text-right font-mono"
              placeholder="0"
              value={watchedLines?.[index]?.debit || ""}
              onChange={(e) =>
                handleAmountChange(index, "debit", e.target.value)
              }
            />
          );
        },
      }),
      columnHelper.accessor("credit", {
        header: () => (
          <div className="text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Credit
          </div>
        ),
        cell: ({ row }) => {
          const index = row.index;
          return (
            <Input
              className="h-8 text-xs text-right font-mono"
              placeholder="0"
              value={watchedLines?.[index]?.credit || ""}
              onChange={(e) =>
                handleAmountChange(index, "credit", e.target.value)
              }
            />
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: () => (
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
            onClick={() => removeLine(row.index)}
          >
            <Trash2 size={14} />
          </Button>
        ),
      }),
    ],
    [availableAccounts, watchedLines, register, setValue],
  );

  // TanStack Table Instance
  const table = useReactTable({
    data: (fields as LineItem[]) || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  const resetForm = () => {
    reset({
      journalType: "General",
      entryDate: new Date().toISOString().split("T")[0],
      lines: [
        {
          id: `${Date.now()}-1`,
          accountId: 0,
          lineDescription: "",
          debit: "",
          credit: "",
        },
        {
          id: `${Date.now()}-2`,
          accountId: 0,
          lineDescription: "",
          debit: "",
          credit: "",
        },
      ],
    });
    setApiError(null);
    setSuccessMessage(null);
  };

  // Submit Handler dengan tipe ter-infer dari Zod
  const onSubmit: SubmitHandler<z.output<typeof journalEntrySchema>> = async (
    data,
  ) => {
    setApiError(null);
    setSuccessMessage(null);

    const effective = data.lines.filter(
      (l) =>
        Number(l.accountId) > 0 &&
        (parseFormattedNumber(l.debit || "") > 0 ||
          parseFormattedNumber(l.credit || "") > 0),
    );

    try {
      if (isEdit) {
        const updatePayload = {
          id: entryId,
          updateJournalEntryRequest: {
            entryDate: data.entryDate,
            journalType: data.journalType,
            transactionNumber: displayedTxNumber,
            lines: effective.map((l) => ({
              accountId: Number(l.accountId),
              lineDescription: l.lineDescription || "",
              debit: parseFormattedNumber(l.debit || ""),
              credit: parseFormattedNumber(l.credit || ""),
            })),
          },
        };

        const res: any = await updateJournalEntry(
          updatePayload as any,
        ).unwrap();
        const txNum = res?.transactionNumber || displayedTxNumber;
        setSuccessMessage(`Updated ${txNum}`);
        setTimeout(() => router.push("/reports/general-journal"), 1200);
      } else {
        const createPayload = {
          createJournalEntryRequest: {
            journalType: data.journalType,
            entryDate: data.entryDate,
            lines: effective.map((l) => ({
              accountId: Number(l.accountId),
              lineDescription: l.lineDescription || "",
              debit: parseFormattedNumber(l.debit || ""),
              credit: parseFormattedNumber(l.credit || ""),
            })),
          },
        };

        const res: any = await createJournalEntry(
          createPayload as any,
        ).unwrap();
        const txNum =
          res?.transactionNumber ||
          res?.data?.transactionNumber ||
          displayedTxNumber;
        setSuccessMessage(`Posted ${txNum}`);
        resetForm();
      }
    } catch (err: any) {
      setApiError(
        err?.data?.message || err?.message || "Failed to post journal entry",
      );
    }
  };

  if (isAccountsLoading || (isEdit && isEditLoading)) {
    return (
      <div className="flex flex-col items-center py-16 gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
              <Edit className="text-primary" />
            ) : (
              <BookOpen className="text-primary" />
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
        <Button variant="outline" size="sm" asChild className="text-sm">
          <Link href="/reports/general-journal" className="gap-1.5">
            <ArrowLeft size={14} /> Back to Journal
          </Link>
        </Button>
      </div>

      {successMessage && (
        <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-300">
          <CheckCircle2 size={16} />
          <AlertDescription className="text-xs">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {(errors.lines || apiError) && (
        <Alert variant="destructive">
          <AlertTriangle size={16} />
          <AlertDescription className="text-xs">
            <ul className="list-disc ml-4">
              {errors.lines?.root?.message && (
                <li>{errors.lines.root.message}</li>
              )}
              {apiError && <li>{apiError}</li>}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {isLocked ? (
        <Alert>
          <Lock size={16} />
          <AlertDescription className="text-xs">
            Journal {displayedTxNumber} is in closed period.{" "}
            <Link href="/reports/general-journal" className="underline">
              Back
            </Link>
          </AlertDescription>
        </Alert>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Transaction Info
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium flex items-center justify-between">
                  <span>Transaction No.</span>
                  {isTxLoading && (
                    <Loader2
                      size={12}
                      className="animate-spin text-muted-foreground"
                    />
                  )}
                </Label>
                <Input
                  className="h-9 font-mono bg-muted text-sm"
                  value={displayedTxNumber}
                  readOnly
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Journal Type</Label>
                <Select
                  value={journalType}
                  onValueChange={(v) =>
                    setValue("journalType", v, { shouldValidate: true })
                  }
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="text-sm">
                    <SelectItem value="General">
                      General Journal (GJ)
                    </SelectItem>
                    <SelectItem value="Adjusting">
                      Adjusting Entry (AJ)
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.journalType && (
                  <p className="text-xs text-red-500 font-medium">
                    {errors.journalType.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Date</Label>
                <Input
                  type="date"
                  className="h-9 text-sm"
                  {...register("entryDate")}
                />
                {errors.entryDate && (
                  <p className="text-xs text-red-500 font-medium">
                    {errors.entryDate.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="py-3 flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-semibold">
                Journal Lines
              </CardTitle>
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
                    <TableCell
                      colSpan={3}
                      className="text-right text-xs font-medium"
                    >
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
                        <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20 text-[11px] gap-1">
                          <CheckCircle2 size={12} /> Balanced
                        </Badge>
                      ) : (
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
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              className="text-sm"
            >
              Reset
            </Button>
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
        <div className="py-16 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="animate-spin" size={16} /> Loading...
        </div>
      }
    >
      <JournalEntryContent />
    </Suspense>
  );
}
