"use client";

import { useState, useEffect, useMemo } from "react";
import { IconAlertTriangle, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  useGetApiV1PeriodsQuery,
  useGetApiV1PeriodsOpenInfoQuery,
  usePostApiV1PeriodsMutation,
  usePostApiV1PeriodsSelectByIdMutation,
  usePostApiV1PeriodsClearSelectionMutation,
  usePostApiV1PeriodsCloseByIdMutation,
} from "@/lib/generatedApi";

import { ApiError, PeriodItem } from "./types";
import { PeriodList } from "./period-list";
import { CreatePeriodForm } from "./create-period-form";

export default function PeriodsPage() {
  const {
    data: rawPeriodsData,
    isLoading,
    refetch: refetchPeriods,
  } = useGetApiV1PeriodsQuery();
  const { data: rawOpenInfoData, isLoading: isLoadingOpenInfo } =
    useGetApiV1PeriodsOpenInfoQuery();

  const [selectPeriodMutation] = usePostApiV1PeriodsSelectByIdMutation();
  const [clearSelectionMutation, { isLoading: isClearing }] =
    usePostApiV1PeriodsClearSelectionMutation();
  const [closePeriodMutation] = usePostApiV1PeriodsCloseByIdMutation();
  const [createPeriodMutation, { isLoading: isCreating }] =
    usePostApiV1PeriodsMutation();

  const periods: PeriodItem[] = useMemo(() => {
    if (Array.isArray(rawPeriodsData)) return rawPeriodsData;
    return (
      (rawPeriodsData as any)?.items || (rawPeriodsData as any)?.periods || []
    );
  }, [rawPeriodsData]);

  const selectedPeriod = periods.find((p) => p.isSelected) || null;
  const openInfo = (rawOpenInfoData as any) || null;

  const [viewMode, setViewMode] = useState<"list" | "create">("list");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectingId, setSelectingId] = useState<number | null>(null);
  const [closingId, setClosingId] = useState<number | null>(null);

  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(2026);
  const [setupMode, setSetupMode] = useState<"LoadExisting" | "CreateNew">(
    "LoadExisting"
  );
  const [cashAccountId, setCashAccountId] = useState("");
  const [bankAccountId, setBankAccountId] = useState("");
  const [retainedId, setRetainedId] = useState("");
  const [cashAccountCode, setCashAccountCode] = useState("101");
  const [cashAccountName, setCashAccountName] = useState("Cash on Hand");
  const [cashBalance, setCashBalance] = useState<number | "">("");
  const [bankAccountCode, setBankAccountCode] = useState("102");
  const [bankAccountName, setBankAccountName] = useState("Bank Account");
  const [bankBalance, setBankBalance] = useState<number | "">("");
  const [retainedCode, setRetainedCode] = useState("301");
  const [retainedName, setRetainedName] = useState("Retained Earnings");

  useEffect(() => {
    const d = new Date();
    setMonth(d.getMonth() + 1);
    setYear(d.getFullYear());
  }, []);

  useEffect(() => {
    if (openInfo) {
      const exists = !!openInfo.hasExistingPermanentAccounts;
      setSetupMode(exists ? "LoadExisting" : "CreateNew");
      if (exists) {
        setCashAccountId(
          openInfo.availableCashAndBankAccounts?.[0]?.id?.toString() || ""
        );
        setBankAccountId(
          openInfo.availableCashAndBankAccounts?.[1]?.id?.toString() ||
            openInfo.availableCashAndBankAccounts?.[0]?.id?.toString() ||
            ""
        );
        setRetainedId(
          openInfo.availableRetainedEarningsAccounts?.[0]?.id?.toString() || ""
        );
      }
    }
  }, [openInfo]);

  const handleSelectPeriod = async (p: PeriodItem) => {
    setErrorMessage(null);
    setSelectingId(p.id);
    try {
      await selectPeriodMutation({ id: p.id }).unwrap();
      setSuccessMessage(`Now viewing: ${p.periodName}`);
      refetchPeriods();
    } catch (err) {
      const error = err as ApiError;
      setErrorMessage(error?.data?.message || "Gagal memilih periode.");
    } finally {
      setSelectingId(null);
    }
  };

  const handleClearSelection = async () => {
    setErrorMessage(null);
    try {
      await clearSelectionMutation().unwrap();
      setSuccessMessage("No period selected.");
      refetchPeriods();
    } catch (err) {
      const error = err as ApiError;
      setErrorMessage(
        error?.data?.message || "Gagal menghapus pilihan periode."
      );
    }
  };

  const handleClosePeriod = async (p: PeriodItem) => {
    if (!confirm(`Close ${p.periodName}? This will lock all entries.`)) return;
    setErrorMessage(null);
    setClosingId(p.id);
    try {
      await closePeriodMutation({ id: p.id }).unwrap();
      setSuccessMessage(`${p.periodName} closed successfully.`);
      refetchPeriods();
    } catch (err) {
      const error = err as ApiError;
      setErrorMessage(error?.data?.message || "Failed to close period.");
    } finally {
      setClosingId(null);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (
      setupMode === "LoadExisting" &&
      (!cashAccountId || !bankAccountId || !retainedId)
    ) {
      setErrorMessage("Select Cash, Bank, and Retained Earnings accounts.");
      return;
    }
    if (setupMode === "LoadExisting" && cashAccountId === bankAccountId) {
      setErrorMessage("Cash and Bank Account cannot be the same account.");
      return;
    }
    try {
      await createPeriodMutation({
        createPeriodRequest: {
          month,
          year,
          setupMode,
          cashAccountId:
            setupMode === "LoadExisting" ? parseInt(cashAccountId, 10) : null,
          bankAccountId:
            setupMode === "LoadExisting" ? parseInt(bankAccountId, 10) : null,
          retainedEarningsAccountId:
            setupMode === "LoadExisting" ? parseInt(retainedId, 10) : null,
          cashAccountCode:
            setupMode === "CreateNew" ? cashAccountCode : undefined,
          cashAccountName:
            setupMode === "CreateNew" ? cashAccountName : undefined,
          cashBalance:
            setupMode === "CreateNew" ? Number(cashBalance) || 0 : undefined,
          bankAccountCode:
            setupMode === "CreateNew" ? bankAccountCode : undefined,
          bankAccountName:
            setupMode === "CreateNew" ? bankAccountName : undefined,
          bankBalance:
            setupMode === "CreateNew" ? Number(bankBalance) || 0 : undefined,
          retainedEarningsAccountCode:
            setupMode === "CreateNew" ? retainedCode : undefined,
          retainedEarningsAccountName:
            setupMode === "CreateNew" ? retainedName : undefined,
        },
      }).unwrap();
      setSuccessMessage("Period opened successfully.");
      setViewMode("list");
      refetchPeriods();
    } catch (err) {
      const error = err as ApiError;
      setErrorMessage(error?.data?.message || "Failed to create period.");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {errorMessage && (
        <Alert
          variant="destructive"
          className="flex justify-between items-center py-2 bg-red-950/50 border-red-900/50 text-red-200"
        >
          <AlertDescription className="flex items-center gap-2 text-xs">
            <IconAlertTriangle size={16} />
            {errorMessage}
          </AlertDescription>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-red-200 hover:bg-red-900/30"
            onClick={() => setErrorMessage(null)}
          >
            <IconX size={14} />
          </Button>
        </Alert>
      )}

      {successMessage && (
        <Alert className="bg-white/[0.06] border-white/10 text-white flex justify-between items-center py-2">
          <AlertDescription className="text-xs">
            {successMessage}
          </AlertDescription>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-white/10 text-white"
            onClick={() => setSuccessMessage(null)}
          >
            <IconX size={14} />
          </Button>
        </Alert>
      )}

      {viewMode === "list" ? (
        <PeriodList
          periods={periods}
          selectedPeriod={selectedPeriod}
          isLoading={isLoading}
          isClearing={isClearing}
          selectingId={selectingId}
          closingId={closingId}
          onClearSelection={handleClearSelection}
          onSelectPeriod={handleSelectPeriod}
          onClosePeriod={handleClosePeriod}
          onOpenCreateView={() => setViewMode("create")}
        />
      ) : (
        <CreatePeriodForm
          month={month}
          year={year}
          setupMode={setupMode}
          cashAccountId={cashAccountId}
          bankAccountId={bankAccountId}
          retainedId={retainedId}
          cashAccountCode={cashAccountCode}
          cashAccountName={cashAccountName}
          cashBalance={cashBalance}
          bankAccountCode={bankAccountCode}
          bankAccountName={bankAccountName}
          bankBalance={bankBalance}
          retainedCode={retainedCode}
          retainedName={retainedName}
          openInfo={openInfo}
          isLoadingOpenInfo={isLoadingOpenInfo}
          isCreating={isCreating}
          setMonth={setMonth}
          setYear={setYear}
          setSetupMode={setSetupMode}
          setCashAccountId={setCashAccountId}
          setBankAccountId={setBankAccountId}
          setRetainedId={setRetainedId}
          setCashAccountCode={setCashAccountCode}
          setCashAccountName={setCashAccountName}
          setCashBalance={setCashBalance}
          setBankAccountCode={setBankAccountCode}
          setBankAccountName={setBankAccountName}
          setBankBalance={setBankBalance}
          setRetainedCode={setRetainedCode}
          setRetainedName={setRetainedName}
          onSubmit={handleCreateSubmit}
          onCancel={() => setViewMode("list")}
        />
      )}
    </div>
  );
}
