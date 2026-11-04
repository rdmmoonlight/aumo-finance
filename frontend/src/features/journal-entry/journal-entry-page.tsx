"use client";

import { Loader2 } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

import { useAppRouter, useSearchParams } from "@/lib/router-compat";
import { parseFormattedNumber } from "@/lib/validations/journal-entry";

import { JournalAlerts } from "#/features/journal-entry/components/journal-alerts";
import { JournalEntryHeader } from "#/features/journal-entry/components/journal-entry-header";
import { JournalFormActions } from "#/features/journal-entry/components/journal-form-actions";
import { JournalLinesTable } from "#/features/journal-entry/components/journal-lines-table";
import { TransactionInfoCard } from "#/features/journal-entry/components/transaction-info-card";

import { useAvailableAccounts } from "#/features/journal-entry/hooks/useAvailableAccounts";
import { useJournalEntryDetail } from "#/features/journal-entry/hooks/useJournalEntryDetail";
import {
  createEmptyLine,
  useJournalForm,
} from "#/features/journal-entry/hooks/useJournalForm";

import { formatNumberWithDots } from "#/features/journal-entry/utils/helpers";
import {
  useCreateJournalEntryMutation,
  useEditJournalEntryMutation,
} from "../journal-entry/api/journalEntryApi";

function JournalEntryContent() {
  const router = useAppRouter();
  const entryId = Number(useSearchParams().get("id") || 0);
  const isEdit = Boolean(entryId);

  const { accounts, isLoading: isAccLoading } = useAvailableAccounts();
  const form = useJournalForm();

  const {
    editData,
    jData,
    isTxLoading,
    isEditLoading,
    displayedTxNumber,
    isLocked,
  } = useJournalEntryDetail(
    isEdit,
    entryId,
    form.watch("journalType"),
    form.watch("entryDate"),
    form.setValue,
  );

  const [apiError, setApiError] = useState<string | null>(null);
  const [createJournal, { isLoading: isCreating }] =
    useCreateJournalEntryMutation();
  const [editJournal, { isLoading: isEditing }] = useEditJournalEntryMutation();

  // Hydration saat edit
  useEffect(() => {
    if (!isEdit || !jData) return;
    if (jData.journalType) form.setValue("journalType", jData.journalType);
    if (jData.entryDate)
      form.setValue("entryDate", jData.entryDate.split("T")[0]);
    if (Array.isArray(jData.lines) && jData.lines.length > 0) {
      form.setValue(
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
  }, [jData, isEdit, form]);

  const onSubmit = async (data: any) => {
    setApiError(null);
    const lines = form.watchedLines || [];

    if (
      lines.some(
        (l: any) =>
          (parseFormattedNumber(l?.debit || "") > 0 ||
            parseFormattedNumber(l?.credit || "") > 0) &&
          Number(l?.accountId || 0) <= 0,
      )
    ) {
      return toast.error(
        "Ada baris yang nominalnya terisi tapi Akun belum dipilih!",
      );
    }
    if (form.totalDebit === 0 && form.totalCredit === 0) {
      return toast.error("Nominal debit dan kredit masih kosong.");
    }
    if (!form.isBalanced) {
      return toast.error(
        `Jurnal tidak balance! Selisih: Rp ${Math.abs(form.totalDebit - form.totalCredit).toLocaleString("id-ID")}`,
      );
    }

    const payloadLines = data.lines
      .filter(
        (l: any) =>
          Number(l.accountId) > 0 &&
          (parseFormattedNumber(l.debit || "") > 0 ||
            parseFormattedNumber(l.credit || "") > 0),
      )
      .map((l: any) => ({
        accountId: Number(l.accountId),
        lineDescription: l.lineDescription || "",
        debit: parseFormattedNumber(l.debit || ""),
        credit: parseFormattedNumber(l.credit || ""),
      }));

    try {
      if (isEdit) {
        const res: any = await editJournal({
          id: entryId,
          body: {
            entryDate: data.entryDate,
            journalType: data.journalType,
            transactionNumber: displayedTxNumber,
            lines: payloadLines,
          },
        }).unwrap();
        toast.success(`Updated ${res?.transactionNumber || displayedTxNumber}`);
        setTimeout(() => router.push("/reports/journals/general"), 800);
      } else {
        const res: any = await createJournal({
          journalType: data.journalType,
          entryDate: data.entryDate,
          lines: payloadLines,
        }).unwrap();
        toast.success(
          `Posted ${res?.transactionNumber || res?.data?.transactionNumber || displayedTxNumber}`,
        );
        form.reset({
          journalType: "General",
          entryDate: new Date().toISOString().split("T")[0],
          lines: [createEmptyLine(), createEmptyLine()],
        });
      }
    } catch (err: any) {
      const msg =
        err?.data?.message || err?.message || "Terjadi kesalahan server";
      setApiError(msg);
      toast.error(msg);
    }
  };

  const onInvalid = () =>
    toast.error("Form tidak valid. Periksa kembali isian jurnal.");

  if (isAccLoading || (isEdit && isEditLoading)) {
    return (
      <div className="flex flex-col items-center py-16 gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" /> Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <JournalEntryHeader
        isEdit={isEdit}
        displayedTxNumber={displayedTxNumber}
      />
      <JournalAlerts
        errors={form.formState.errors}
        apiError={apiError}
        isLocked={isLocked}
        txNumber={displayedTxNumber}
      />

      {!isLocked && (
        <form
          onSubmit={form.handleSubmit(onSubmit, onInvalid)}
          className="space-y-6"
        >
          <TransactionInfoCard
            displayedTxNumber={displayedTxNumber}
            isTxLoading={isTxLoading}
            register={form.register}
            setValue={form.setValue}
            watch={form.watch}
            errors={form.formState.errors}
          />
          <JournalLinesTable
            fields={form.fields as any}
            availableAccounts={accounts}
            watchedLines={form.watchedLines}
            register={form.register}
            setValue={form.setValue}
            totalDebit={form.totalDebit}
            totalCredit={form.totalCredit}
            isBalanced={form.isBalanced}
            onAddLine={form.addLine}
            onRemoveLine={form.removeLine}
            onAmountChange={form.handleAmountChange}
          />
          <JournalFormActions
            isSubmitting={isCreating || isEditing}
            isEdit={isEdit}
            onReset={() =>
              form.reset({
                journalType: "General",
                entryDate: new Date().toISOString().split("T")[0],
                lines: [createEmptyLine(), createEmptyLine()],
              })
            }
          />
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
