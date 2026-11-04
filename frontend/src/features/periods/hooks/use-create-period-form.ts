"use client";

import { type CreatePeriodFormProps } from "#/features/periods/types";
import {
  createPeriodSchema,
  type CreatePeriodFormValues,
  type CreatePeriodOutputValues,
} from "@/lib/validations/period";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";

export function useCreatePeriodForm({
  openInfo,
  initialValues,
  defaultValues,
  isCreating,
  isLoading,
}: CreatePeriodFormProps) {
  const mergedDefaultValues = useMemo<Partial<CreatePeriodFormValues>>(
    () => ({
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      setupMode: openInfo?.hasExistingPermanentAccounts
        ? "LoadExisting"
        : "CreateNew",
      cashAccountId: "",
      bankAccountId: "",
      retainedId: "",
      cashAccountCode: "",
      cashAccountName: "",
      cashBalance: "",
      bankAccountCode: "",
      bankAccountName: "",
      bankBalance: "",
      retainedCode: "",
      retainedName: "",
      ...defaultValues,
      ...initialValues,
    }),
    [openInfo, defaultValues, initialValues],
  );

  const methods = useForm<
    CreatePeriodFormValues,
    any,
    CreatePeriodOutputValues
  >({
    resolver: zodResolver(createPeriodSchema),
    defaultValues: mergedDefaultValues,
  });

  const setupMode = methods.watch("setupMode");
  const month = methods.watch("month");

  return {
    methods,
    setupMode,
    month,
    cashAccountId: methods.watch("cashAccountId"),
    bankAccountId: methods.watch("bankAccountId"),
    retainedId: methods.watch("retainedId"),
    isSubmitting: isCreating || isLoading,
    mergedDefaultValues,
  };
}
