"use client";

import { Link } from "@tanstack/react-router";
import { AlertTriangle, Loader2, Lock, Save } from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useAppRouter, useSearchParams } from "@/lib/router-compat";
import {
  journalEntrySchema,
  parseFormattedNumber,
} from "@/lib/validations/journal-entry";
import { chartOfAccountsApi } from "../chart-of-accounts/api/chartOfAccountsApi";
import {
  useCreateJournalEntryMutation,
  useEditJournalEntryMutation,
  useGetJournalEntryByIdQuery,
  useGetNextTransactionNumberQuery,
} from "../journal-entry/api/journalEntryApi";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import { JournalEntryHeader } from "#/features/journal-entry/components/journal-entry-header";
import { JournalLinesTable } from "#/features/journal-entry/components/journal-lines-table";
import { TransactionInfoCard } from "#/features/journal-entry/components/transaction-info-card";
import {
  AccountOption,
  LineItem,
  formatNumberWithDots,
  zodResolver,
} from "#/features/journal-entry/utils/helpers";

function JournalEntryContent() {
  const router = useAppRouter();
  const searchParams = useSearchParams();
  const entryIdParam = searchParams.get("id");
  const isEdit = Boolean(entryIdParam);
  const entryId = entryIdParam ? parseInt(entryIdParam, 10) : 0;

  const [apiError, setApiError] = useState<string | null>(null);

  // Accounts state
  const [isAccountsLoading, setIsAccountsLoading] = useState<boolean>(true);
  const [availableAccounts, setAvailableAccounts] = useState<AccountOption[]>(
    []
  );
  const accountsQuery =
    chartOfAccountsApi.endpoints.getChartOfAccounts.useQuery();

  const [isTxLoading, setIsTxLoading] = useState<boolean>(false);
  const [nextTxNumber, setNextTxNumber] = useState<string | null>(null);
  const [isEditLoading, setIsEditLoading] = useState<boolean>(isEdit);
  const [editData, setEditData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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

  const { fields, append, remove } = useFieldArray({ control, name: "lines" });
  const journalType = watch("journalType");
  const entryDate = watch("entryDate");
  const watchedLines = watch("lines");

  // RTK Query Hooks
  const nextTransactionNumberQuery = useGetNextTransactionNumberQuery(
    { journalType, entryDate },
    { skip: isEdit }
  );
  const journalEntryQuery = useGetJournalEntryByIdQuery(
    { id: entryId },
    { skip: !isEdit }
  );
  const [createJournalEntry] = useCreateJournalEntryMutation();
  const [editJournalEntry] = useEditJournalEntryMutation();

  // 1. Fetch Chart of Accounts
  useEffect(() => {
    setIsAccountsLoading(accountsQuery.isLoading);
    if (accountsQuery.error) {
      toast.error("Gagal memuat Chart of Accounts");
      return;
    }
    if (accountsQuery.data) {
      const res: any = accountsQuery.data;
      const list = Array.isArray(res.accounts)
        ? res.accounts
        : Array.isArray(res.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];
      setAvailableAccounts(
        list.map((a: any) => ({
          ...a,
          id: Number(a.id || 0),
          referenceNumber: a.referenceNumber ?? "",
          accountName: a.accountName ?? "",
        }))
      );
    }
  }, [accountsQuery.data, accountsQuery.error, accountsQuery.isLoading]);

  // 2. Fetch Next Transaction Number
  useEffect(() => {
    setIsTxLoading(!isEdit && nextTransactionNumberQuery.isLoading);
    if (isEdit || !nextTransactionNumberQuery.data) return;

    const raw: any = nextTransactionNumberQuery.data;
    const txNo =
      typeof raw === "string"
        ? raw
        : raw.transactionNumber || raw.nextTransactionNumber || raw.data || "";
    setNextTxNumber(txNo);
  }, [
    isEdit,
    nextTransactionNumberQuery.data,
    nextTransactionNumberQuery.isLoading,
  ]);

  // 3. Fetch Detail Journal Entry
  useEffect(() => {
    if (!isEdit || isNaN(entryId)) return;
    setIsEditLoading(journalEntryQuery.isLoading);
    if (journalEntryQuery.error) {
      toast.error("Gagal memuat detail jurnal");
      return;
    }
    if (!journalEntryQuery.data) return;

    const resData: any = journalEntryQuery.data;
    setEditData(resData);
    const jData = resData.entry || resData.data || resData;
    if (jData && typeof jData === "object") {
      if (jData.journalType) setValue("journalType", jData.journalType);
      if (jData.entryDate) setValue("entryDate", jData.entryDate.split("T")[0]);
      if (Array.isArray(jData.lines) && jData.lines.length > 0) {
        setValue(
          "lines",
          jData.lines.map((l: any, i: number) => ({
            id: l.id?.toString() || `${Date.now()}-${i}`,
            accountId: Number(l.accountId || 0),
            lineDescription: l.lineDescription || "",
            debit: l.debit > 0 ? formatNumberWithDots(l.debit) : "",
            credit: l.credit > 0 ? formatNumberWithDots(l.credit) : "",
          }))
        );
      }
    }
  }, [
    isEdit,
    entryId,
    journalEntryQuery.data,
    journalEntryQuery.error,
    journalEntryQuery.isLoading,
    setValue,
  ]);

  const displayedTxNumber = useMemo(() => {
    if (isEdit)
      return (
        (editData?.entry || editData?.data || editData)?.transactionNumber ||
        "Loading..."
      );
    return nextTxNumber || "Loading...";
  }, [isEdit, editData, nextTxNumber]);

  const isLocked = Boolean(
    isEdit && (editData?.isLocked || editData?.entry?.isLocked)
  );

  const totalDebit = useMemo(
    () =>
      (watchedLines || []).reduce(
        (s, l) => s + parseFormattedNumber(l?.debit || ""),
        0
      ),
    [watchedLines]
  );

  const totalCredit = useMemo(
    () =>
      (watchedLines || []).reduce(
        (s, l) => s + parseFormattedNumber(l?.credit || ""),
        0
      ),
    [watchedLines]
  );

  const isBalanced = useMemo(
    () => totalDebit > 0 && totalDebit === totalCredit,
    [totalDebit, totalCredit]
  );

  const addLine = () =>
    append({
      id: `${Date.now()}-${Math.random()}`,
      accountId: 0,
      lineDescription: "",
      debit: "",
      credit: "",
    });

  const removeLine = (index: number) => {
    if (fields.length <= 2) {
      toast.warning("Minimal 2 baris jurnal wajib ada.");
      return;
    }
    setApiError(null);
    remove(index);
  };

  const handleAmountChange = (
    index: number,
    field: "debit" | "credit",
    value: string
  ) => {
    const formatted = formatNumberWithDots(value);
    setValue(`lines.${index}.${field}`, formatted, { shouldValidate: true });
    if (value !== "") {
      setValue(`lines.${index}.${field === "debit" ? "credit" : "debit"}`, "", {
        shouldValidate: true,
      });
    }
  };

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
  };

  // Toast feedback jika pengguna mengklik tombol Submit yang sedang ter-disabled
  const handleDisabledSubmitClick = () => {
    if (isSubmitting) return;

    const lines = watchedLines || [];
    const hasInvalidAccount = lines.some(
      (l) =>
        (parseFormattedNumber(l?.debit || "") > 0 ||
          parseFormattedNumber(l?.credit || "") > 0) &&
        Number(l?.accountId || 0) <= 0
    );

    if (hasInvalidAccount) {
      toast.error("Ada baris jurnal yang nominalnya terisi tetapi Akun belum dipilih!");
      return;
    }

    if (totalDebit === 0 && totalCredit === 0) {
      toast.error("Gagal menyimpan: Nominal debit dan kredit masih kosong.");
      return;
    }

    if (!isBalanced) {
      const diff = Math.abs(totalDebit - totalCredit).toLocaleString("id-ID");
      toast.error(
        `Jurnal tidak balance! Selisih: Rp ${diff}. (Debit: Rp ${totalDebit.toLocaleString(
          "id-ID"
        )} vs Kredit: Rp ${totalCredit.toLocaleString("id-ID")})`
      );
    }
  };

  const onSubmit: SubmitHandler<z.output<typeof journalEntrySchema>> = async (
    data
  ) => {
    setApiError(null);
    setIsSubmitting(true);

    const effective = data.lines.filter(
      (l) =>
        Number(l.accountId) > 0 &&
        (parseFormattedNumber(l.debit || "") > 0 ||
          parseFormattedNumber(l.credit || "") > 0)
    );
    const payloadLines = effective.map((l) => ({
      accountId: Number(l.accountId),
      lineDescription: l.lineDescription || "",
      debit: parseFormattedNumber(l.debit || ""),
      credit: parseFormattedNumber(l.credit || ""),
    }));

    try {
      if (isEdit) {
        const res: any = await editJournalEntry({
          id: entryId,
          body: {
            entryDate: data.entryDate,
            journalType: data.journalType,
            transactionNumber: displayedTxNumber,
            lines: payloadLines,
          },
        }).unwrap();
        toast.success(`Updated ${res?.transactionNumber || displayedTxNumber}`);
        setTimeout(() => router.push("/reports/journals/general"), 1200);
      } else {
        const res: any = await createJournalEntry({
          journalType: data.journalType,
          entryDate: data.entryDate,
          lines: payloadLines,
        }).unwrap();
        toast.success(
          `Posted ${res?.transactionNumber ||
          res?.data?.transactionNumber ||
          displayedTxNumber
          }`
        );
        resetForm();
      }
    } catch (err: any) {
      const msg = err?.message || "An unexpected error occurred";
      setApiError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
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
      <JournalEntryHeader
        isEdit={isEdit}
        displayedTxNumber={displayedTxNumber}
      />

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
            <Link to="/reports/journals/general" className="underline">
              Back
            </Link>
          </AlertDescription>
        </Alert>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <TransactionInfoCard
            displayedTxNumber={displayedTxNumber}
            isTxLoading={isTxLoading}
            register={register}
            setValue={setValue}
            watch={watch}
            errors={errors}
          />

          <JournalLinesTable
            fields={fields as LineItem[]}
            availableAccounts={availableAccounts}
            watchedLines={watchedLines}
            register={register}
            setValue={setValue}
            totalDebit={totalDebit}
            totalCredit={totalCredit}
            isBalanced={isBalanced}
            onAddLine={addLine}
            onRemoveLine={removeLine}
            onAmountChange={handleAmountChange}
          />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              className="text-sm"
              disabled={isSubmitting}
            >
              Reset
            </Button>

            <Button
              type="button"
              disabled={isSubmitting}
              onClick={(e) => {
                // 1. Cek validasi Akun & Balance secara manual lebih dulu
                const lines = watchedLines || [];
                const hasInvalidAccount = lines.some(
                  (l) =>
                    (parseFormattedNumber(l?.debit || "") > 0 ||
                      parseFormattedNumber(l?.credit || "") > 0) &&
                    Number(l?.accountId || 0) <= 0
                );

                if (hasInvalidAccount) {
                  toast.error(
                    "Ada baris jurnal yang nominalnya terisi tetapi Akun belum dipilih!"
                  );
                  return;
                }

                if (totalDebit === 0 && totalCredit === 0) {
                  toast.error("Gagal menyimpan: Nominal debit dan kredit masih kosong.");
                  return;
                }

                if (!isBalanced) {
                  const diff = Math.abs(totalDebit - totalCredit).toLocaleString("id-ID");
                  toast.error(
                    `Jurnal tidak balance! Selisih: Rp ${diff}. (Debit: Rp ${totalDebit.toLocaleString(
                      "id-ID"
                    )} vs Kredit: Rp ${totalCredit.toLocaleString("id-ID")})`
                  );
                  return;
                }

                // 2. Jalankan handleSubmit dengan error callback untuk menangkap kegagalan Zod Schema
                handleSubmit(
                  (data) => {
                    // Callback jika Zod VALID -> kirim ke API backend
                    onSubmit(data);
                  },
                  (invalidErrors) => {
                    // Callback jika Zod INVALID -> Tampilkan Toast error dari Schema Validation
                    console.error("Form validation errors:", invalidErrors);

                    const firstErrorKey = Object.keys(invalidErrors)[0];
                    const firstErrorMsg = invalidErrors[firstErrorKey]?.message;

                    if (firstErrorMsg) {
                      toast.error(`Validasi Form Gagal: ${String(firstErrorMsg)}`);
                    } else {
                      toast.error("Format data form belum sesuai. Periksa kembali isian Anda.");
                    }
                  }
                )(e);
              }}
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