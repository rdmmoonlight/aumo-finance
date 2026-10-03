"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowLeft,
  CalendarPlus,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LockOpen,
  PlusCircle,
  RefreshCw,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import {
  createPeriodSchema,
  type CreatePeriodFormValues,
  type CreatePeriodOutputValues,
} from "@/lib/validations/period";

/* -------------------------------------------------------------------------- */
/*                            TYPES & INTERFACES                              */
/* -------------------------------------------------------------------------- */

export interface ApiError {
  data?: { message?: string };
  message?: string;
}

export interface AccountItem {
  id?: number | string;
  displayLabel?: string;
  referenceNumber?: string;
  accountName?: string;
}

export interface PeriodItem {
  id: number;
  periodName?: string;
  startDate?: string;
  endDate?: string;
  isClosed?: boolean;
  isSelected?: boolean;
}

export interface OpenInfoData {
  hasExistingPermanentAccounts?: boolean;
  availableCashAndBankAccounts?: AccountItem[];
  availableRetainedEarningsAccounts?: AccountItem[];
}

export interface PeriodListProps {
  periods: PeriodItem[];
  selectedPeriod: PeriodItem | null;
  isLoading: boolean;
  isClearing: boolean;
  selectingId: number | null;
  closingId: number | null;
  onClearSelection: () => void;
  onSelectPeriod: (p: PeriodItem) => void;
  onClosePeriod: (p: PeriodItem) => void;
  onOpenCreateView: () => void;
}

export interface CreatePeriodFormProps {
  openInfo?: OpenInfoData | null;
  isLoadingOpenInfo?: boolean;
  isCreating?: boolean;
  isLoading?: boolean;
  initialValues?: Partial<CreatePeriodFormValues>;
  defaultValues?: Partial<CreatePeriodFormValues>;
  onSubmit: (values: CreatePeriodOutputValues) => void | Promise<void>;
  onCancel: () => void;
  // Mengizinkan tambahan props tak terduga yang di-pass dari parent
  [key: string]: any;
}

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/* -------------------------------------------------------------------------- */
/*                                PERIOD LIST                                 */
/* -------------------------------------------------------------------------- */

export function PeriodList({
  selectedPeriod,
  isClearing,
  onClearSelection,
  onOpenCreateView,
}: PeriodListProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-white">Periods</h2>
        <div className="flex gap-2">
          {selectedPeriod && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearSelection}
              disabled={isClearing}
            >
              Clear Selection
            </Button>
          )}
          <Button size="sm" onClick={onOpenCreateView}>
            <PlusCircle size={16} className="mr-1.5" />
            New Period
          </Button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            CREATE PERIOD FORM                              */
/* -------------------------------------------------------------------------- */

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
  const mergedDefaultValues: Partial<CreatePeriodFormValues> = {
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
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreatePeriodFormValues, any, CreatePeriodOutputValues>({
    resolver: zodResolver(createPeriodSchema),
    defaultValues: mergedDefaultValues,
  });

  const setupMode = watch("setupMode");
  const month = watch("month");
  const cashAccountId = watch("cashAccountId");
  const bankAccountId = watch("bankAccountId");
  const retainedId = watch("retainedId");

  const submitting = isCreating || isLoading;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2 text-white">
            <CalendarPlus className="text-white" size={22} /> Open New Period
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Start monthly cycle. Opening balance posted on day 1.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 bg-transparent border-white/10 text-xs text-zinc-300 hover:bg-white/10 hover:text-white"
          onClick={onCancel}
        >
          <ArrowLeft size={14} /> Back
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Card Period */}
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
                value={
                  month !== undefined && month !== null ? String(month) : ""
                }
                onValueChange={(v) => setValue("month", Number(v))}
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
                <p className="text-xs text-red-500 font-medium">
                  {errors.month.message}
                </p>
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
                <p className="text-xs text-red-500 font-medium">
                  {errors.year.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card Permanent Accounts Setup */}
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
                <Loader2 className="animate-spin inline mr-1" size={14} />{" "}
                Memuat informasi akun...
              </div>
            ) : (
              <>
                <RadioGroup
                  value={setupMode}
                  onValueChange={(v: "LoadExisting" | "CreateNew") =>
                    setValue("setupMode", v)
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem
                      value="LoadExisting"
                      id="load"
                      disabled={!openInfo?.hasExistingPermanentAccounts}
                      className="border-white/20 text-white"
                    />
                    <Label
                      htmlFor="load"
                      className="flex items-center gap-1 text-xs cursor-pointer text-zinc-300"
                    >
                      <RefreshCw size={12} /> Use Existing
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem
                      value="CreateNew"
                      id="create"
                      className="border-white/20 text-white"
                    />
                    <Label
                      htmlFor="create"
                      className="flex items-center gap-1 text-xs cursor-pointer text-zinc-300"
                    >
                      <PlusCircle size={12} /> Register New
                    </Label>
                  </div>
                </RadioGroup>

                {setupMode === "LoadExisting" ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Select Cash Account */}
                    <div className="space-y-1.5">
                      <Label className="text-sm text-zinc-300">
                        Cash Account
                      </Label>
                      <Select
                        value={cashAccountId || ""}
                        onValueChange={(v) => setValue("cashAccountId", v)}
                      >
                        <SelectTrigger className="bg-[#0e0e10] border-white/10 text-white text-sm">
                          <SelectValue placeholder="Pilih Akun Kas" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1e1e22] border-white/10 text-white text-sm">
                          {openInfo?.availableCashAndBankAccounts?.map(
                            (a: AccountItem) => (
                              <SelectItem
                                key={a.id}
                                value={a.id?.toString() || ""}
                              >
                                {a.displayLabel ||
                                  `${a.referenceNumber} - ${a.accountName}`}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                      {errors.cashAccountId && (
                        <p className="text-xs text-red-500 font-medium">
                          {errors.cashAccountId.message}
                        </p>
                      )}
                    </div>

                    {/* Select Bank Account */}
                    <div className="space-y-1.5">
                      <Label className="text-sm text-zinc-300">
                        Bank Account
                      </Label>
                      <Select
                        value={bankAccountId || ""}
                        onValueChange={(v) => setValue("bankAccountId", v)}
                      >
                        <SelectTrigger className="bg-[#0e0e10] border-white/10 text-white text-sm">
                          <SelectValue placeholder="Pilih Akun Bank" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1e1e22] border-white/10 text-white text-sm">
                          {openInfo?.availableCashAndBankAccounts?.map(
                            (a: AccountItem) => (
                              <SelectItem
                                key={a.id}
                                value={a.id?.toString() || ""}
                              >
                                {a.displayLabel ||
                                  `${a.referenceNumber} - ${a.accountName}`}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                      {errors.bankAccountId && (
                        <p className="text-xs text-red-500 font-medium">
                          {errors.bankAccountId.message}
                        </p>
                      )}
                    </div>

                    {/* Select Retained Earnings Account */}
                    <div className="space-y-1.5">
                      <Label className="text-sm text-zinc-300">
                        Retained Earnings
                      </Label>
                      <Select
                        value={retainedId || ""}
                        onValueChange={(v) => setValue("retainedId", v)}
                      >
                        <SelectTrigger className="bg-[#0e0e10] border-white/10 text-white text-sm">
                          <SelectValue placeholder="Pilih Retained Earnings" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1e1e22] border-white/10 text-white text-sm">
                          {openInfo?.availableRetainedEarningsAccounts?.map(
                            (a: AccountItem) => (
                              <SelectItem
                                key={a.id}
                                value={a.id?.toString() || ""}
                              >
                                {a.displayLabel ||
                                  `${a.referenceNumber} - ${a.accountName}`}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                      {errors.retainedId && (
                        <p className="text-xs text-red-500 font-medium">
                          {errors.retainedId.message}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Row Inputs - Cash */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-sm text-zinc-300">
                          Cash Code
                        </Label>
                        <Input
                          {...register("cashAccountCode")}
                          className="bg-[#0e0e10] border-white/10 text-white text-sm"
                        />
                        {errors.cashAccountCode && (
                          <p className="text-xs text-red-500 font-medium">
                            {errors.cashAccountCode.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm text-zinc-300">
                          Cash Name
                        </Label>
                        <Input
                          {...register("cashAccountName")}
                          className="bg-[#0e0e10] border-white/10 text-white text-sm"
                        />
                        {errors.cashAccountName && (
                          <p className="text-xs text-red-500 font-medium">
                            {errors.cashAccountName.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm text-zinc-300">
                          Cash Balance
                        </Label>
                        <Input
                          type="number"
                          {...register("cashBalance", {
                            setValueAs: (v) => (v === "" ? "" : Number(v)),
                          })}
                          className="bg-[#0e0e10] border-white/10 text-white text-sm"
                        />
                      </div>
                    </div>

                    {/* Row Inputs - Bank */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-sm text-zinc-300">
                          Bank Code
                        </Label>
                        <Input
                          {...register("bankAccountCode")}
                          className="bg-[#0e0e10] border-white/10 text-white text-sm"
                        />
                        {errors.bankAccountCode && (
                          <p className="text-xs text-red-500 font-medium">
                            {errors.bankAccountCode.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm text-zinc-300">
                          Bank Name
                        </Label>
                        <Input
                          {...register("bankAccountName")}
                          className="bg-[#0e0e10] border-white/10 text-white text-sm"
                        />
                        {errors.bankAccountName && (
                          <p className="text-xs text-red-500 font-medium">
                            {errors.bankAccountName.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm text-zinc-300">
                          Bank Balance
                        </Label>
                        <Input
                          type="number"
                          {...register("bankBalance", {
                            setValueAs: (v) => (v === "" ? "" : Number(v)),
                          })}
                          className="bg-[#0e0e10] border-white/10 text-white text-sm"
                        />
                      </div>
                    </div>

                    {/* Row Inputs - Retained Earnings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-sm text-zinc-300">
                          Retained Code
                        </Label>
                        <Input
                          {...register("retainedCode")}
                          className="bg-[#0e0e10] border-white/10 text-white text-sm"
                        />
                        {errors.retainedCode && (
                          <p className="text-xs text-red-500 font-medium">
                            {errors.retainedCode.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm text-zinc-300">
                          Retained Name
                        </Label>
                        <Input
                          {...register("retainedName")}
                          className="bg-[#0e0e10] border-white/10 text-white text-sm"
                        />
                        {errors.retainedName && (
                          <p className="text-xs text-red-500 font-medium">
                            {errors.retainedName.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="bg-transparent border-white/10 text-sm text-zinc-300 hover:bg-white/10 hover:text-white"
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
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            GET PERIOD COLUMNS                              */
/* -------------------------------------------------------------------------- */

export interface GetPeriodColumnsProps {
  selectedPeriod: PeriodItem | null;
  selectingId: number | null;
  closingId: number | null;
  onSelectPeriod: (p: PeriodItem) => void;
  onClosePeriod: (p: PeriodItem) => void;
}

export const getPeriodColumns = ({
  selectedPeriod,
  selectingId,
  closingId,
  onSelectPeriod,
  onClosePeriod,
}: GetPeriodColumnsProps): ColumnDef<PeriodItem>[] => [
  {
    accessorKey: "periodName",
    header: () => (
      <span className="pl-6 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
        Period Name
      </span>
    ),
    cell: ({ row }) => {
      const p = row.original;
      const isSelected = selectedPeriod?.id === p.id;
      return (
        <div className="pl-6 font-medium">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-sm font-bold",
                isSelected ? "text-white" : "text-zinc-200",
              )}
            >
              {p.periodName}
            </span>
            {isSelected && (
              <Badge className="h-5 text-[11px] bg-white text-black border-0 px-1.5 font-bold tracking-wider">
                VIEWING
              </Badge>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "startDate",
    header: () => (
      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
        Start
      </span>
    ),
    cell: ({ getValue }) => {
      const val = getValue<string | undefined>();
      return (
        <span className="text-xs text-zinc-400">
          {val ? new Date(val).toLocaleDateString() : "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "endDate",
    header: () => (
      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
        End
      </span>
    ),
    cell: ({ getValue }) => {
      const val = getValue<string | undefined>();
      return (
        <span className="text-xs text-zinc-400">
          {val ? new Date(val).toLocaleDateString() : "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "isClosed",
    header: () => (
      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
        Status
      </span>
    ),
    meta: { headerClassName: "text-center", cellClassName: "text-center" },
    cell: ({ getValue }) => {
      const isClosed = getValue<boolean>();
      return isClosed ? (
        <Badge className="h-6 text-[11px] gap-1 bg-white/10 text-zinc-400 border-white/10">
          <Lock size={10} /> Closed
        </Badge>
      ) : (
        <Badge className="h-6 text-[11px] gap-1 bg-emerald-500/15 text-emerald-400 border-emerald-500/20">
          <LockOpen size={10} /> Active
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => (
      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 pr-6">
        Action
      </span>
    ),
    meta: {
      headerClassName: "text-center pr-6",
      cellClassName: "text-center pr-6",
    },
    cell: ({ row }) => {
      const p = row.original;
      const isSelected = selectedPeriod?.id === p.id;
      const isSelectingThis = selectingId === p.id;
      const isClosingThis = closingId === p.id;

      return (
        <div className="flex justify-center gap-1.5">
          <Button
            type="button"
            size="sm"
            className={cn(
              "h-7 text-[11px] gap-1.5 font-bold tracking-wide border transition-all",
              isSelected
                ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-zinc-200"
                : "bg-[#1e1e22] text-zinc-400 border-white/10 hover:bg-white hover:text-black hover:border-white",
            )}
            onClick={() => onSelectPeriod(p)}
            disabled={isSelectingThis}
          >
            {isSelectingThis ? (
              <Loader2 size={14} className="animate-spin" />
            ) : isSelected ? (
              <EyeOff size={14} />
            ) : (
              <Eye size={14} />
            )}
            {isSelected ? "Viewing" : "View"}
          </Button>

          {!p.isClosed && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 px-0 bg-transparent border border-transparent text-zinc-500 hover:text-white hover:bg-white/10 hover:border-white/10"
              onClick={() => onClosePeriod(p)}
              disabled={isClosingThis}
            >
              {isClosingThis ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Lock size={14} />
              )}
            </Button>
          )}
        </div>
      );
    },
  },
];
