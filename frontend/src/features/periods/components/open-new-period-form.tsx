"use client";

import {
  MONTH_NAMES,
  type AccountItem,
  type CreatePeriodFormProps,
} from "#/features/periods/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetGeneralLedgerPermanentQuery } from "@/features/reports/api/reportsApi";
import {
  createPeriodSchema,
  type CreatePeriodFormValues,
  type CreatePeriodOutputValues,
} from "@/lib/validations/period";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  CalendarPlus,
  Loader2,
  PlusCircle,
  RefreshCw,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

function FormHeader({ onCancel }: { onCancel?: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2 text-white">
          <CalendarPlus size={22} /> Open New Period
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Start monthly cycle. Opening balance posted on day 1.
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onCancel}
        className="gap-1.5 bg-transparent border-white/10 text-xs text-zinc-300 hover:bg-white/10"
      >
        <ArrowLeft size={14} /> Back
      </Button>
    </div>
  );
}

function PeriodCard() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<CreatePeriodFormValues>();
  const month = watch("month");
  return (
    <Card className="bg-[#151519] border-white/[0.07]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-white">
          Period
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm text-zinc-300">Month</Label>
          <Select
            value={month ? String(month) : ""}
            onValueChange={(v) =>
              setValue("month", Number(v), { shouldValidate: true })
            }
          >
            <SelectTrigger className="bg-[#0e0e10] border-white/10 text-white text-sm">
              <SelectValue placeholder="Pilih Bulan" />
            </SelectTrigger>
            <SelectContent className="bg-[#1e1e22] border-white/10 text-white text-sm">
              {MONTH_NAMES.map((n, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.month && (
            <p className="text-xs text-red-500">{errors.month.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm text-zinc-300">Year</Label>
          <Input
            type="number"
            {...register("year", { valueAsNumber: true })}
            className="bg-[#0e0e10] border-white/10 text-white text-sm"
          />
          {errors.year && (
            <p className="text-xs text-red-500">{errors.year.message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ExistingAccounts({ openInfo }: { openInfo: any }) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  // Ambil saldo buku besar permanen dari API reportsApi
  const { data: glData, isLoading: isLoadingGL } =
    useGetGeneralLedgerPermanentQuery();

  const fields = [
    {
      key: "cashAccountId",
      label: "Cash Account",
      ph: "Pilih Akun Kas",
      opts: openInfo?.availableCashAndBankAccounts,
    },
    {
      key: "bankAccountId",
      label: "Bank Account",
      ph: "Pilih Akun Bank",
      opts: openInfo?.availableCashAndBankAccounts,
    },
    {
      key: "retainedId",
      label: "Retained Earnings",
      ph: "Pilih Retained Earnings",
      opts: openInfo?.availableRetainedEarningsAccounts,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {fields.map((f) => {
        const rawValue = watch(f.key);
        const selectedIdStr =
          rawValue !== undefined && rawValue !== null && rawValue !== ""
            ? String(rawValue)
            : "";

        // Cari data akun dari General Ledger Permanent API
        const glAccount = glData?.accounts?.find(
          (acc: any) => String(acc.accountId ?? acc.id) === selectedIdStr,
        );

        // Fallback pencarian dari openInfo jika GL tidak tersedia
        const fallbackAccount = f.opts?.find(
          (a: any) => String(a.id) === selectedIdStr,
        );

        const balanceValue =
          glAccount?.endingBalance ??
          glAccount?.balance ??
          glAccount?.currentBalance ??
          fallbackAccount?.balance;

        return (
          <div key={f.key} className="space-y-1.5">
            <Label className="text-sm text-zinc-300">{f.label}</Label>
            <Select
              value={selectedIdStr}
              onValueChange={(v) =>
                setValue(f.key, v, { shouldValidate: true, shouldDirty: true })
              }
            >
              <SelectTrigger className="bg-[#0e0e10] border-white/10 text-white text-sm">
                <SelectValue placeholder={f.ph} />
              </SelectTrigger>
              <SelectContent className="bg-[#1e1e22] border-white/10 text-white text-sm">
                {f.opts?.map((a: any) => {
                  const label =
                    a.displayLabel ||
                    (a.code && a.name
                      ? `${a.code} - ${a.name}`
                      : a.name || a.accountName);
                  return (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* Display status loading / nilai saldo */}
            {isLoadingGL && selectedIdStr && (
              <p className="text-xs text-zinc-500 mt-1">
                Memuat saldo akhir...
              </p>
            )}

            {!isLoadingGL &&
              selectedIdStr &&
              balanceValue !== undefined &&
              balanceValue !== null && (
                <p className="text-xs text-emerald-400 font-mono mt-1 font-semibold">
                  Ending Balance: Rp{" "}
                  {Number(balanceValue).toLocaleString("id-ID")}
                </p>
              )}

            {(errors as any)[f.key] && (
              <p className="text-xs text-red-500">
                {(errors as any)[f.key].message}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function NewAccounts() {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const F = ({ name, label }: { name: any; label: string }) => (
    <div className="space-y-1.5">
      <Label className="text-sm text-zinc-300">{label}</Label>
      <Input
        {...register(name)}
        className="bg-[#0e0e10] border-white/10 text-white text-sm"
      />
      {(errors as any)[name] && (
        <p className="text-xs text-red-500">{(errors as any)[name].message}</p>
      )}
    </div>
  );
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <F name="cashAccountCode" label="Cash Code" />
        <F name="cashAccountName" label="Cash Name" />
        <div className="space-y-1.5">
          <Label className="text-sm text-zinc-300">Cash Balance</Label>
          <Input
            type="number"
            {...register("cashBalance", {
              setValueAs: (v) => (v === "" ? "" : Number(v)),
            })}
            className="bg-[#0e0e10] border-white/10 text-white text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <F name="bankAccountCode" label="Bank Code" />
        <F name="bankAccountName" label="Bank Name" />
        <div className="space-y-1.5">
          <Label className="text-sm text-zinc-300">Bank Balance</Label>
          <Input
            type="number"
            {...register("bankBalance", {
              setValueAs: (v) => (v === "" ? "" : Number(v)),
            })}
            className="bg-[#0e0e10] border-white/10 text-white text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <F name="retainedCode" label="Retained Code" />
        <F name="retainedName" label="Retained Name" />
      </div>
    </div>
  );
}

function PermanentAccountsCard({
  openInfo,
  isLoadingOpenInfo,
}: {
  openInfo: any;
  isLoadingOpenInfo?: boolean;
}) {
  const { watch, setValue } = useFormContext();
  const setupMode = watch("setupMode") || "CreateNew";
  const hasExisting = Boolean(openInfo?.hasExistingPermanentAccounts);

  return (
    <Card className="bg-[#151519] border-white/[0.07]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-white">
          Permanent Accounts Setup
        </CardTitle>
        <CardDescription className="text-xs text-zinc-500">
          Choose existing or create new
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoadingOpenInfo ? (
          <div className="text-center py-4 text-xs text-zinc-500">
            <Loader2 className="animate-spin inline mr-1" size={14} /> Memuat
            informasi akun...
          </div>
        ) : (
          <>
            <RadioGroup
              value={String(setupMode)}
              onValueChange={(v) =>
                setValue("setupMode", v, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem
                  value="LoadExisting"
                  id="load"
                  disabled={!hasExisting}
                  className="border-white/20 text-white data-[state=checked]:border-white"
                />
                <Label
                  htmlFor="load"
                  className={`flex items-center gap-1 text-xs ${!hasExisting ? "text-zinc-600 cursor-not-allowed" : "text-zinc-300 cursor-pointer"}`}
                >
                  <RefreshCw size={12} /> Use Existing
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem
                  value="CreateNew"
                  id="create"
                  className="border-white/20 text-white data-[state=checked]:border-white"
                />
                <Label
                  htmlFor="create"
                  className="flex items-center gap-1 text-xs text-zinc-300 cursor-pointer"
                >
                  <PlusCircle size={12} /> Register New
                </Label>
              </div>
            </RadioGroup>
            {setupMode === "LoadExisting" ? (
              <ExistingAccounts openInfo={openInfo} />
            ) : (
              <NewAccounts />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// --- Main Export ---

export function CreatePeriodForm({
  openInfo,
  isLoadingOpenInfo,
  isCreating,
  isLoading,
  initialValues,
  defaultValues,
  onSubmit,
  onCancel,
}: CreatePeriodFormProps) {
  const mergedDefaults = useMemo(
    () => ({
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      setupMode: (openInfo?.hasExistingPermanentAccounts
        ? "LoadExisting"
        : "CreateNew") as CreatePeriodFormValues["setupMode"],
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
    defaultValues: mergedDefaults,
  });

  // Re-sync setupMode ketika data openInfo dari backend telah terisi
  useEffect(() => {
    if (openInfo) {
      if (openInfo.hasExistingPermanentAccounts) {
        methods.setValue("setupMode", "LoadExisting", { shouldValidate: true });
      } else {
        methods.setValue("setupMode", "CreateNew", { shouldValidate: true });
      }
    }
  }, [openInfo, methods]);

  const submitting = isCreating || isLoading;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <FormHeader onCancel={onCancel} />
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit as any)}
          className="space-y-6"
        >
          <PeriodCard />
          <PermanentAccountsCard
            openInfo={openInfo}
            isLoadingOpenInfo={isLoadingOpenInfo}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="bg-transparent border-white/10 text-sm text-zinc-300 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-white text-black text-sm font-medium hover:bg-zinc-200"
            >
              {submitting ? "Creating..." : "Submit Period"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
