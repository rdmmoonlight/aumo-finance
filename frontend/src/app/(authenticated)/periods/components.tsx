import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  CalendarPlus,
  ArrowLeft,
  RefreshCw,
  PlusCircle,
  Loader2,
  Lock,
  LockOpen,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
/*                                 PERIOD LIST                                */
/* -------------------------------------------------------------------------- */

export function PeriodList({
  periods,
  selectedPeriod,
  isLoading,
  isClearing,
  selectingId,
  closingId,
  onClearSelection,
  onSelectPeriod,
  onClosePeriod,
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
/*                             CREATE PERIOD FORM                             */
/* -------------------------------------------------------------------------- */

export interface CreatePeriodFormProps {
  month: number;
  year: number;
  setupMode: "LoadExisting" | "CreateNew";
  cashAccountId: string;
  bankAccountId: string;
  retainedId: string;
  cashAccountCode: string;
  cashAccountName: string;
  cashBalance: number | "";
  bankAccountCode: string;
  bankAccountName: string;
  bankBalance: number | "";
  retainedCode: string;
  retainedName: string;
  openInfo: OpenInfoData | null;
  isLoadingOpenInfo: boolean;
  isCreating: boolean;
  setMonth: (v: number) => void;
  setYear: (v: number) => void;
  setSetupMode: (v: "LoadExisting" | "CreateNew") => void;
  setCashAccountId: (v: string) => void;
  setBankAccountId: (v: string) => void;
  setRetainedId: (v: string) => void;
  setCashAccountCode: (v: string) => void;
  setCashAccountName: (v: string) => void;
  setCashBalance: (v: number | "") => void;
  setBankAccountCode: (v: string) => void;
  setBankAccountName: (v: string) => void;
  setBankBalance: (v: number | "") => void;
  setRetainedCode: (v: string) => void;
  setRetainedName: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function CreatePeriodForm({
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
  openInfo,
  isLoadingOpenInfo,
  isCreating,
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
  onSubmit,
  onCancel,
}: CreatePeriodFormProps) {
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

      <form onSubmit={onSubmit} className="space-y-6">
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
                value={String(month)}
                onValueChange={(v) => setMonth(Number(v))}
              >
                <SelectTrigger className="bg-[#0e0e10] border-white/10 text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1e1e22] border-white/10 text-white text-sm">
                  {MONTH_NAMES.map((n, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-zinc-300">Year</Label>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                required
                className="bg-[#0e0e10] border-white/10 text-white text-sm"
              />
            </div>
          </CardContent>
        </Card>

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
                <Loader2 className="animate-spin inline mr-1" size={14} />
                Memuat informasi akun...
              </div>
            ) : (
              <>
                <RadioGroup
                  value={setupMode}
                  onValueChange={(v: "LoadExisting" | "CreateNew") =>
                    setSetupMode(v)
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
                    <div className="space-y-1.5">
                      <Label className="text-sm text-zinc-300">
                        Cash Account
                      </Label>
                      <Select
                        value={cashAccountId}
                        onValueChange={setCashAccountId}
                      >
                        <SelectTrigger className="bg-[#0e0e10] border-white/10 text-white text-sm">
                          <SelectValue />
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
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm text-zinc-300">
                        Bank Account
                      </Label>
                      <Select
                        value={bankAccountId}
                        onValueChange={setBankAccountId}
                      >
                        <SelectTrigger className="bg-[#0e0e10] border-white/10 text-white text-sm">
                          <SelectValue />
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
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm text-zinc-300">
                        Retained Earnings
                      </Label>
                      <Select value={retainedId} onValueChange={setRetainedId}>
                        <SelectTrigger className="bg-[#0e0e10] border-white/10 text-white text-sm">
                          <SelectValue />
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
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-sm text-zinc-300">
                          Cash Code
                        </Label>
                        <Input
                          value={cashAccountCode}
                          onChange={(e) => setCashAccountCode(e.target.value)}
                          className="bg-[#0e0e10] border-white/10 text-white text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm text-zinc-300">
                          Cash Name
                        </Label>
                        <Input
                          value={cashAccountName}
                          onChange={(e) => setCashAccountName(e.target.value)}
                          className="bg-[#0e0e10] border-white/10 text-white text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm text-zinc-300">
                          Cash Balance
                        </Label>
                        <Input
                          type="number"
                          value={cashBalance}
                          onChange={(e) =>
                            setCashBalance(
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                            )
                          }
                          className="bg-[#0e0e10] border-white/10 text-white text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-sm text-zinc-300">
                          Bank Code
                        </Label>
                        <Input
                          value={bankAccountCode}
                          onChange={(e) => setBankAccountCode(e.target.value)}
                          className="bg-[#0e0e10] border-white/10 text-white text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm text-zinc-300">
                          Bank Name
                        </Label>
                        <Input
                          value={bankAccountName}
                          onChange={(e) => setBankAccountName(e.target.value)}
                          className="bg-[#0e0e10] border-white/10 text-white text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm text-zinc-300">
                          Bank Balance
                        </Label>
                        <Input
                          type="number"
                          value={bankBalance}
                          onChange={(e) =>
                            setBankBalance(
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                            )
                          }
                          className="bg-[#0e0e10] border-white/10 text-white text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-sm text-zinc-300">
                          Retained Code
                        </Label>
                        <Input
                          value={retainedCode}
                          onChange={(e) => setRetainedCode(e.target.value)}
                          className="bg-[#0e0e10] border-white/10 text-white text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm text-zinc-300">
                          Retained Name
                        </Label>
                        <Input
                          value={retainedName}
                          onChange={(e) => setRetainedName(e.target.value)}
                          className="bg-[#0e0e10] border-white/10 text-white text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

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
            disabled={isCreating}
            className="bg-white text-black text-sm font-medium hover:bg-zinc-200"
          >
            {isCreating ? "Creating..." : "Submit Period"}
          </Button>
        </div>
      </form>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             GET PERIOD COLUMNS                             */
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
