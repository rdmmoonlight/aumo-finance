"use client";

import { useMemo, useState } from "react";
import {
  PeriodItem,
  useClearSelectionMutation,
  useClosePeriodMutation,
  useCreatePeriodMutation,
  useGetPeriodsOpenInfoQuery,
  useGetPeriodsQuery,
  useSelectPeriodMutation,
} from "../api/periodsApi";
import type { ApiError, CreatePeriodValues } from "../types";
import { usePeriodFormState } from "./use-period-form";

export function usePeriodsPage() {
  const {
    data: periodsData,
    isLoading,
    isError: isGetPeriodsError,
  } = useGetPeriodsQuery();
  const { data: openInfo, isLoading: isLoadingOpenInfo } =
    useGetPeriodsOpenInfoQuery();

  const [selectPeriod, { isLoading: isSelecting }] = useSelectPeriodMutation();
  const [clearSelection, { isLoading: isClearing }] =
    useClearSelectionMutation();
  const [closePeriod, { isLoading: isClosing }] = useClosePeriodMutation();
  const [createPeriod, { isLoading: isCreating }] = useCreatePeriodMutation();

  const form = usePeriodFormState(openInfo);

  const [viewMode, setViewMode] = useState<"list" | "create">("list");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectingId, setSelectingId] = useState<number | null>(null);
  const [closingId, setClosingId] = useState<number | null>(null);

  const periods: PeriodItem[] = useMemo(() => {
    if (!periodsData) return [];
    if (Array.isArray(periodsData)) return periodsData;
    if ("periods" in periodsData && Array.isArray(periodsData.periods))
      return periodsData.periods;
    if ("items" in periodsData && Array.isArray(periodsData.items))
      return periodsData.items;
    return [];
  }, [periodsData]);

  const selectedPeriod = useMemo(
    () => periods.find((p) => p.isSelected) || null,
    [periods],
  );

  const handleSelectPeriod = async (p: PeriodItem) => {
    setErrorMessage(null);
    setSelectingId(p.id);
    try {
      await selectPeriod({ id: p.id }).unwrap();
      setSuccessMessage(`Now viewing: ${p.periodName}`);
    } catch (err) {
      setErrorMessage(
        (err as ApiError)?.data?.message || "Gagal memilih periode.",
      );
    } finally {
      setSelectingId(null);
    }
  };

  const handleClearSelection = async () => {
    setErrorMessage(null);
    try {
      await clearSelection().unwrap();
      setSuccessMessage("No period selected.");
    } catch (err) {
      setErrorMessage(
        (err as ApiError)?.data?.message || "Gagal menghapus pilihan periode.",
      );
    }
  };

  const handleClosePeriod = async (p: PeriodItem) => {
    if (!confirm(`Close ${p.periodName}? This will lock all entries.`)) return;
    setErrorMessage(null);
    setClosingId(p.id);
    try {
      await closePeriod({ id: p.id }).unwrap();
      setSuccessMessage(`${p.periodName} closed successfully.`);
    } catch (err) {
      setErrorMessage(
        (err as ApiError)?.data?.message || "Failed to close period.",
      );
    } finally {
      setClosingId(null);
    }
  };

  const handleCreateSubmit = async (values?: CreatePeriodValues) => {
    setErrorMessage(null);
    const currentSetupMode = values?.setupMode ?? form.setupMode;

    if (
      currentSetupMode === "LoadExisting" &&
      (!(values?.cashAccountId ?? form.cashAccountId) ||
        !(values?.bankAccountId ?? form.bankAccountId) ||
        !(values?.retainedId ?? form.retainedId))
    ) {
      setErrorMessage("Select Cash, Bank, and Retained Earnings accounts.");
      return;
    }

    try {
      await createPeriod({
        createPeriodRequest: {
          month: Number(values?.month ?? form.month),
          year: Number(values?.year ?? form.year),
          setupMode: currentSetupMode,
          cashAccountId:
            currentSetupMode === "LoadExisting"
              ? parseInt(values?.cashAccountId ?? form.cashAccountId, 10)
              : null,
          bankAccountId:
            currentSetupMode === "LoadExisting"
              ? parseInt(values?.bankAccountId ?? form.bankAccountId, 10)
              : null,
          retainedEarningsAccountId:
            currentSetupMode === "LoadExisting"
              ? parseInt(values?.retainedId ?? form.retainedId, 10)
              : null,
          cashAccountCode:
            currentSetupMode === "CreateNew"
              ? (values?.cashAccountCode ?? form.cashAccountCode)
              : undefined,
          cashAccountName:
            currentSetupMode === "CreateNew"
              ? (values?.cashAccountName ?? form.cashAccountName)
              : undefined,
          cashBalance:
            currentSetupMode === "CreateNew"
              ? Number(values?.cashBalance ?? form.cashBalance) || 0
              : undefined,
          bankAccountCode:
            currentSetupMode === "CreateNew"
              ? (values?.bankAccountCode ?? form.bankAccountCode)
              : undefined,
          bankAccountName:
            currentSetupMode === "CreateNew"
              ? (values?.bankAccountName ?? form.bankAccountName)
              : undefined,
          bankBalance:
            currentSetupMode === "CreateNew"
              ? Number(values?.bankBalance ?? form.bankBalance) || 0
              : undefined,
          retainedEarningsAccountCode:
            currentSetupMode === "CreateNew"
              ? (values?.retainedCode ?? form.retainedCode)
              : undefined,
          retainedEarningsAccountName:
            currentSetupMode === "CreateNew"
              ? (values?.retainedName ?? form.retainedName)
              : undefined,
        },
      }).unwrap();
      setSuccessMessage("Period opened successfully.");
      setViewMode("list");
    } catch (err) {
      setErrorMessage(
        (err as ApiError)?.data?.message || "Failed to create period.",
      );
    }
  };

  return {
    periods,
    openInfo,
    selectedPeriod,
    form,
    viewMode,
    setViewMode,
    errorMessage,
    setErrorMessage,
    successMessage,
    setSuccessMessage,
    isLoading,
    isLoadingOpenInfo,
    isGetPeriodsError,
    isSelecting,
    isClearing,
    isClosing,
    isCreating,
    selectingId,
    closingId,
    handleSelectPeriod,
    handleClearSelection,
    handleClosePeriod,
    handleCreateSubmit,
  };
}
