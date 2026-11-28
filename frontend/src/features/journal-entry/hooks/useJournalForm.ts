import {
  journalEntrySchema,
  parseFormattedNumber,
} from "@/lib/validations/journal-entry";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { formatNumberWithDots, zodResolver } from "../utils/helpers";

export const createEmptyLine = () => ({
  id: `${Date.now()}-${Math.random()}`,
  accountId: 0,
  lineDescription: "",
  debit: "",
  credit: "",
});

export function useJournalForm() {
  const form = useForm<
    z.input<typeof journalEntrySchema>,
    any,
    z.output<typeof journalEntrySchema>
  >({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      journalType: "General",
      entryDate: new Date().toISOString().split("T")[0],
      lines: [createEmptyLine(), createEmptyLine()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  });
  const watchedLines = form.watch("lines");

  const totalDebit = watchedLines.reduce(
    (s, l) => s + parseFormattedNumber(l?.debit || ""),
    0,
  );
  const totalCredit = watchedLines.reduce(
    (s, l) => s + parseFormattedNumber(l?.credit || ""),
    0,
  );
  const isBalanced = totalDebit > 0 && totalDebit === totalCredit;

  const addLine = () => append(createEmptyLine());
  const removeLine = (i: number) => {
    if (fields.length <= 2)
      return toast.warning("Minimal 2 baris jurnal wajib ada.");
    remove(i);
  };
  const handleAmountChange = (
    i: number,
    field: "debit" | "credit",
    value: string,
  ) => {
    form.setValue(`lines.${i}.${field}`, formatNumberWithDots(value), {
      shouldValidate: true,
    });
    if (value)
      form.setValue(
        `lines.${i}.${field === "debit" ? "credit" : "debit"}`,
        "",
        { shouldValidate: true },
      );
  };

  return {
    ...form,
    fields,
    watchedLines,
    totalDebit,
    totalCredit,
    isBalanced,
    addLine,
    removeLine,
    handleAmountChange,
    createEmptyLine,
  };
}
