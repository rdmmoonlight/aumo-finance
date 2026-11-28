"use client";

import { useEffect, useMemo, useState } from "react";
import type { PeriodsOpenInfo } from "../api/periodsApi";

export function usePeriodFormState(openInfo?: PeriodsOpenInfo) {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [setupMode, setSetupMode] = useState<"LoadExisting" | "CreateNew">(
    "LoadExisting",
  );
  const [cashAccountId, setCashAccountId] = useState("");
  const [bankAccountId, setBankAccountId] = useState("");
  const [retainedId, setRetainedId] = useState("");
  const [cashAccountCode, setCashAccountCode] = useState("");
  const [cashAccountName, setCashAccountName] = useState("");
  const [cashBalance, setCashBalance] = useState<number | "">("");
  const [bankAccountCode, setBankAccountCode] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankBalance, setBankBalance] = useState<number | "">("");
  const [retainedCode, setRetainedCode] = useState("");
  const [retainedName, setRetainedName] = useState("");

  useEffect(() => {
    if (!openInfo) return;
    const exists = !!openInfo.hasExistingPermanentAccounts;
    setSetupMode(exists ? "LoadExisting" : "CreateNew");
    if (exists) {
      setCashAccountId(
        openInfo.availableCashAndBankAccounts?.[0]?.id?.toString() || "",
      );
      setBankAccountId(
        openInfo.availableCashAndBankAccounts?.[1]?.id?.toString() ||
          openInfo.availableCashAndBankAccounts?.[0]?.id?.toString() ||
          "",
      );
      setRetainedId(
        openInfo.availableRetainedEarningsAccounts?.[0]?.id?.toString() || "",
      );
    }
  }, [openInfo]);

  const initialValues = useMemo(
    () => ({
      month,
      year,
      setupMode,
      cashAccountId,
      bankAccountId,
      retainedId,
      cashAccountCode,
      cashAccountName,
      cashBalance,
      bankAccountCode,
      bankAccountName,
      bankBalance,
      retainedCode,
      retainedName,
    }),
    [
      month,
      year,
      setupMode,
      cashAccountId,
      bankAccountId,
      retainedId,
      cashAccountCode,
      cashAccountName,
      cashBalance,
      bankAccountCode,
      bankAccountName,
      bankBalance,
      retainedCode,
      retainedName,
    ],
  );

  return {
    // values
    month,
    year,
    setupMode,
    cashAccountId,
    bankAccountId,
    retainedId,
    cashAccountCode,
    cashAccountName,
    cashBalance,
    bankAccountCode,
    bankAccountName,
    bankBalance,
    retainedCode,
    retainedName,
    // setters
    setMonth,
    setYear,
    setSetupMode,
    setCashAccountId,
    setBankAccountId,
    setRetainedId,
    setCashAccountCode,
    setCashAccountName,
    setCashBalance,
    setBankAccountCode,
    setBankAccountName,
    setBankBalance,
    setRetainedCode,
    setRetainedName,
    initialValues,
  };
}
