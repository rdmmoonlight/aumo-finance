import {
  IconCalendarPlus,
  IconArrowLeft,
  IconRefresh,
  IconCirclePlus,
  IconLoader2,
} from "@tabler/icons-react";

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

import { AccountItem, OpenInfoData } from "./types";

const MONTH_NAMES = [
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

interface CreatePeriodFormProps {
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
            <IconCalendarPlus className="text-white" size={22} /> Open New
            Period
          </h1>
          <p className="text-sm text-zinc-400">
            Start monthly cycle. Opening balance posted on day 1.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 bg-transparent border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white"
          onClick={onCancel}
        >
          <IconArrowLeft size={14} /> Back
        </Button>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Card className="bg-[#151519] border-white/[0.07]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white">Period</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-zinc-300">Month</Label>
              <Select
                value={String(month)}
                onValueChange={(v) => setMonth(Number(v))}
              >
                <SelectTrigger className="bg-[#0e0e10] border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1e1e22] border-white/10 text-white">
                  {MONTH_NAMES.map((n, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-zinc-300">Year</Label>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                required
                className="bg-[#0e0e10] border-white/10 text-white"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#151519] border-white/[0.07]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white">
              Permanent Accounts Setup
            </CardTitle>
            <CardDescription className="text-zinc-500">
              Choose existing or create new
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingOpenInfo ? (
              <div className="text-center py-4 text-xs text-zinc-500">
                <IconLoader2 className="animate-spin inline mr-1" size={14} />
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
                      <IconRefresh size={12} /> Use Existing
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
                      <IconCirclePlus size={12} /> Register New
                    </Label>
                  </div>
                </RadioGroup>

                {setupMode === "LoadExisting" ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-zinc-300">Cash Account</Label>
                      <Select
                        value={cashAccountId}
                        onValueChange={setCashAccountId}
                      >
                        <SelectTrigger className="bg-[#0e0e10] border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1e1e22] border-white/10">
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
                      <Label className="text-zinc-300">Bank Account</Label>
                      <Select
                        value={bankAccountId}
                        onValueChange={setBankAccountId}
                      >
                        <SelectTrigger className="bg-[#0e0e10] border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1e1e22] border-white/10">
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
                      <Label className="text-zinc-300">Retained Earnings</Label>
                      <Select value={retainedId} onValueChange={setRetainedId}>
                        <SelectTrigger className="bg-[#0e0e10] border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1e1e22] border-white/10">
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
                        <Label className="text-zinc-300">Cash Code</Label>
                        <Input
                          value={cashAccountCode}
                          onChange={(e) => setCashAccountCode(e.target.value)}
                          className="bg-[#0e0e10] border-white/10 text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-zinc-300">Cash Name</Label>
                        <Input
                          value={cashAccountName}
                          onChange={(e) => setCashAccountName(e.target.value)}
                          className="bg-[#0e0e10] border-white/10 text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-zinc-300">Cash Balance</Label>
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
                          className="bg-[#0e0e10] border-white/10 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-zinc-300">Bank Code</Label>
                        <Input
                          value={bankAccountCode}
                          onChange={(e) => setBankAccountCode(e.target.value)}
                          className="bg-[#0e0e10] border-white/10 text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-zinc-300">Bank Name</Label>
                        <Input
                          value={bankAccountName}
                          onChange={(e) => setBankAccountName(e.target.value)}
                          className="bg-[#0e0e10] border-white/10 text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-zinc-300">Bank Balance</Label>
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
                          className="bg-[#0e0e10] border-white/10 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-zinc-300">Retained Code</Label>
                        <Input
                          value={retainedCode}
                          onChange={(e) => setRetainedCode(e.target.value)}
                          className="bg-[#0e0e10] border-white/10 text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-zinc-300">Retained Name</Label>
                        <Input
                          value={retainedName}
                          onChange={(e) => setRetainedName(e.target.value)}
                          className="bg-[#0e0e10] border-white/10 text-white"
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
            className="bg-transparent border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isCreating}
            className="bg-white text-black hover:bg-zinc-200"
          >
            {isCreating ? "Creating..." : "Submit Period"}
          </Button>
        </div>
      </form>
    </div>
  );
}
