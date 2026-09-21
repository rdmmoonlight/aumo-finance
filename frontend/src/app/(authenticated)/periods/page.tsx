"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  IconCalendar,
  IconCalendarPlus,
  IconEye,
  IconEyeOff,
  IconPlus,
  IconLock,
  IconLockOpen,
  IconArrowLeft,
  IconAlertTriangle,
  IconX,
  IconInfoCircle,
  IconRefresh,
  IconCirclePlus,
  IconCalendarOff,
  IconLoader2,
} from "@tabler/icons-react";
import { usePeriodStore, PeriodItem } from "@/lib/periodStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Alert, AlertDescription } from "@/components/ui/alert";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function PeriodsPage() {
  const router = useRouter();
  const {
    periods,
    selectedPeriod,
    openInfo,
    loading,
    creating,
    error: storeError,
    fetchPeriods,
    fetchOpenInfo,
    createPeriod,
    selectPeriod,
    clearSelection,
    closePeriod,
    clearError,
  } = usePeriodStore();

  const [viewMode, setViewMode] = useState<"list" | "create">("list");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(2026);
  const [setupMode, setSetupMode] = useState<"LoadExisting" | "CreateNew">("LoadExisting");

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
    fetchPeriods();
  }, [fetchPeriods]);

  const loadOpenInfoData = async () => {
    const info = await fetchOpenInfo();
    if (info) {
      const exists = info.hasExistingPermanentAccounts;
      setSetupMode(exists ? "LoadExisting" : "CreateNew");
      if (exists) {
        setCashAccountId(info.availableCashAndBankAccounts[0]?.id.toString() || "");
        setBankAccountId(
          info.availableCashAndBankAccounts[1]?.id.toString() ||
          info.availableCashAndBankAccounts[0]?.id.toString() || ""
        );
        setRetainedId(info.availableRetainedEarningsAccounts[0]?.id.toString() || "");
      }
    }
  };

  const handleOpenCreateView = () => {
    setViewMode("create");
    loadOpenInfoData();
  };

  const handleSelectPeriod = async (p: PeriodItem) => {
    setErrorMessage(null);
    const ok = await selectPeriod(p.id);
    if (ok) {
      setSuccessMessage(`Viewing ${p.periodName}`);
    } else {
      setErrorMessage("Gagal memilih periode.");
    }
  };

  const handleClearSelection = async () => {
    setErrorMessage(null);
    const ok = await clearSelection();
    if (ok) {
      setSuccessMessage("No period selected.");
    }
  };

  const handleClosePeriod = async (p: PeriodItem) => {
    if (!confirm(`Close ${p.periodName}?`)) return;
    setErrorMessage(null);
    const res = await closePeriod(p.id);
    if (res.success) {
      setSuccessMessage(res.message || `${p.periodName} closed successfully.`);
    } else {
      setErrorMessage(res.message || "Failed to close period.");
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (setupMode === "LoadExisting" && (!cashAccountId || !bankAccountId || !retainedId)) {
      setErrorMessage("Select Cash, Bank, and Retained Earnings accounts.");
      return;
    }
    if (setupMode === "LoadExisting" && cashAccountId === bankAccountId) {
      setErrorMessage("Cash and Bank Account cannot be the same account.");
      return;
    }

    const payload = {
      month,
      year,
      setupMode,
      cashAccountId: setupMode === "LoadExisting" ? parseInt(cashAccountId, 10) : null,
      bankAccountId: setupMode === "LoadExisting" ? parseInt(bankAccountId, 10) : null,
      retainedEarningsAccountId: setupMode === "LoadExisting" ? parseInt(retainedId, 10) : null,
      cashAccountCode: setupMode === "CreateNew" ? cashAccountCode : undefined,
      cashAccountName: setupMode === "CreateNew" ? cashAccountName : undefined,
      cashBalance: setupMode === "CreateNew" ? Number(cashBalance) || 0 : undefined,
      bankAccountCode: setupMode === "CreateNew" ? bankAccountCode : undefined,
      bankAccountName: setupMode === "CreateNew" ? bankAccountName : undefined,
      bankBalance: setupMode === "CreateNew" ? Number(bankBalance) || 0 : undefined,
      retainedEarningsAccountCode: setupMode === "CreateNew" ? retainedCode : undefined,
      retainedEarningsAccountName: setupMode === "CreateNew" ? retainedName : undefined,
    };

    const res = await createPeriod(payload);
    if (res.success) {
      setSuccessMessage(res.message || "Period opened successfully.");
      setViewMode("list");
    } else {
      setErrorMessage(res.message || "Failed to create period.");
    }
  };

  const displayError = errorMessage || storeError;
  const totalOpening = (Number(cashBalance) || 0) + (Number(bankBalance) || 0);

  return (
    <div className="space-y-6 max-w-5xl">
      {displayError && (
        <Alert variant="destructive" className="flex justify-between items-center">
          <AlertDescription className="flex items-center gap-2 text-xs">
            <IconAlertTriangle size={16} />
            {displayError}
          </AlertDescription>
          <button onClick={() => { setErrorMessage(null); clearError(); }}>
            <IconX size={14} />
          </button>
        </Alert>
      )}
      {successMessage && (
        <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-300 flex justify-between items-center">
          <AlertDescription className="text-xs">{successMessage}</AlertDescription>
          <button onClick={() => setSuccessMessage(null)}>
            <IconX size={14} />
          </button>
        </Alert>
      )}

      {viewMode === "list" ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <IconCalendar className="text-primary" size={22} /> Accounting Periods
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Click <IconEye size={14} className="inline" /> to view period - whole app follows it
              </p>
            </div>
            <div className="flex gap-2">
              {selectedPeriod && (
                <Button variant="outline" size="sm" className="gap-1.5" onClick={handleClearSelection}>
                  <IconEyeOff size={14} /> Stop Viewing
                </Button>
              )}
              <Button size="sm" className="gap-1.5" onClick={handleOpenCreateView}>
                <IconPlus size={14} /> Open New Period
              </Button>
            </div>
          </div>
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 py-3">
              <CardTitle className="text-sm">Period List</CardTitle>
              <Badge variant="secondary" className="font-mono text-xs">{periods.length} total</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Period Name</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        <IconLoader2 className="animate-spin inline mr-2" size={16} /> Loading...
                      </TableCell>
                    </TableRow>
                  ) : (
                    periods.map((p) => {
                      const isSelected = selectedPeriod?.id === p.id;
                      return (
                        <TableRow key={p.id} className={isSelected ? "bg-muted/50" : ""}>
                          <TableCell className="pl-6 font-bold flex items-center gap-2">
                            {p.periodName}
                            {isSelected && (
                              <Badge className="gap-1 bg-primary/15 text-primary border-primary/20">
                                <IconEye size={10} /> Viewing
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs">{new Date(p.startDate).toLocaleDateString()}</TableCell>
                          <TableCell className="text-xs">{new Date(p.endDate).toLocaleDateString()}</TableCell>
                          <TableCell className="text-center">
                            {p.isClosed ? (
                              <Badge variant="secondary" className="gap-1">
                                <IconLock size={10} /> Closed
                              </Badge>
                            ) : (
                              <Badge className="gap-1 bg-emerald-500/15 text-emerald-600 border-emerald-500/20">
                                <IconLockOpen size={10} /> Active
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center pr-6">
                            <div className="flex justify-center gap-1">
                              <Button
                                variant={isSelected ? "secondary" : "outline"}
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleSelectPeriod(p)}
                              >
                                <IconEye size={14} />
                              </Button>
                              {!p.isClosed && (
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7 text-amber-600"
                                  onClick={() => handleClosePeriod(p)}
                                >
                                  <IconLock size={14} />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                  {!loading && periods.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                        <IconCalendarOff className="mx-auto mb-2" size={28} />
                        <p className="font-medium">No periods yet</p>
                        <p className="text-xs">Click Open New Period to start</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <IconCalendarPlus className="text-primary" size={22} /> Open New Period
              </h1>
              <p className="text-sm text-muted-foreground">
                Start monthly cycle. Opening balance posted on day 1.
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setViewMode("list")}>
              <IconArrowLeft size={14} /> Back
            </Button>
          </div>
          <form onSubmit={handleCreateSubmit} className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Period</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Month</Label>
                  <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MONTH_NAMES.map((n, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Year</Label>
                  <Input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} required />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Permanent Accounts Setup</CardTitle>
                <CardDescription>Choose existing or create new</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={setupMode} onValueChange={(v: any) => setSetupMode(v)} className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="LoadExisting" id="load" disabled={!openInfo?.hasExistingPermanentAccounts} />
                    <Label htmlFor="load" className="flex items-center gap-1 text-xs cursor-pointer">
                      <IconRefresh size={12} /> Use Existing
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="CreateNew" id="create" />
                    <Label htmlFor="create" className="flex items-center gap-1 text-xs cursor-pointer">
                      <IconCirclePlus size={12} /> Register New
                    </Label>
                  </div>
                </RadioGroup>
                {!openInfo?.hasExistingPermanentAccounts && (
                  <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-300">
                    <IconInfoCircle size={16} />
                    <AlertDescription className="text-xs">
                      No existing Cash/Bank & Retained accounts found - new accounts required
                    </AlertDescription>
                  </Alert>
                )}

                {setupMode === "LoadExisting" ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label>Cash Account</Label>
                      <Select value={cashAccountId} onValueChange={setCashAccountId}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {openInfo?.availableCashAndBankAccounts.map((a) => (
                            <SelectItem key={a.id} value={a.id.toString()}>
                              {a.displayLabel || `${a.referenceNumber} - ${a.accountName}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Bank Account</Label>
                      <Select value={bankAccountId} onValueChange={setBankAccountId}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {openInfo?.availableCashAndBankAccounts.map((a) => (
                            <SelectItem key={a.id} value={a.id.toString()}>
                              {a.displayLabel || `${a.referenceNumber} - ${a.accountName}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Retained Earnings</Label>
                      <Select value={retainedId} onValueChange={setRetainedId}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {openInfo?.availableRetainedEarningsAccounts.map((a) => (
                            <SelectItem key={a.id} value={a.id.toString()}>
                              {a.displayLabel || `${a.referenceNumber} - ${a.accountName}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label>Cash Code</Label>
                        <Input value={cashAccountCode} onChange={(e) => setCashAccountCode(e.target.value)} required />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Cash Name</Label>
                        <Input value={cashAccountName} onChange={(e) => setCashAccountName(e.target.value)} required />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Cash Balance</Label>
                        <Input
                          type="number"
                          value={cashBalance}
                          onChange={(e) => setCashBalance(e.target.value === "" ? "" : Number(e.target.value))}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label>Bank Code</Label>
                        <Input value={bankAccountCode} onChange={(e) => setBankAccountCode(e.target.value)} required />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Bank Name</Label>
                        <Input value={bankAccountName} onChange={(e) => setBankAccountName(e.target.value)} required />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Bank Balance</Label>
                        <Input
                          type="number"
                          value={bankBalance}
                          onChange={(e) => setBankBalance(e.target.value === "" ? "" : Number(e.target.value))}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Retained Code</Label>
                        <Input value={retainedCode} onChange={(e) => setRetainedCode(e.target.value)} required />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Retained Name</Label>
                        <Input value={retainedName} onChange={(e) => setRetainedName(e.target.value)} required />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Opening Retained Earnings: <strong>{totalOpening.toLocaleString()}</strong>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setViewMode("list")}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating && <IconLoader2 className="animate-spin mr-2" size={14} />}
                Open Period
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
