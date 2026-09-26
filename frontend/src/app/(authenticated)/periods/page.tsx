"use client";

import { useState, useEffect, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";

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
  IconRefresh,
  IconCirclePlus,
  IconCalendarOff,
  IconLoader2,
} from "@tabler/icons-react";

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
import { cn } from "@/lib/utils";

import {
  useGetApiV1PeriodsQuery,
  useGetApiV1PeriodsOpenInfoQuery,
  usePostApiV1PeriodsMutation,
  usePostApiV1PeriodsSelectByIdMutation,
  usePostApiV1PeriodsClearSelectionMutation,
  usePostApiV1PeriodsCloseByIdMutation,
} from "@/lib/generatedApi";

interface ApiError {
  data?: { message?: string };
  message?: string;
}
interface AccountItem {
  id?: number | string;
  displayLabel?: string;
  referenceNumber?: string;
  accountName?: string;
}
interface PeriodItem {
  id: number;
  periodName?: string;
  startDate?: string;
  endDate?: string;
  isClosed?: boolean;
  isSelected?: boolean;
}

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
    "LoadExisting",
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
        error?.data?.message || "Gagal menghapus pilihan periode.",
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

  // TanStack Table Column Definitions
  const columns = useMemo<ColumnDef<PeriodItem>[]>(
    () => [
      {
        accessorKey: "periodName",
        header: () => <span className="pl-6 text-zinc-500">Period Name</span>,
        cell: ({ row }) => {
          const p = row.original;
          const isSelected = selectedPeriod?.id === p.id;
          return (
            <div className="pl-6 font-medium">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "font-bold",
                    isSelected ? "text-white" : "text-zinc-200",
                  )}
                >
                  {p.periodName}
                </span>
                {isSelected && (
                  <Badge className="h-5 bg-white text-black border-0 px-1.5 font-bold tracking-wider">
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
        header: () => <span className="text-zinc-500">Start</span>,
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
        header: () => <span className="text-zinc-500">End</span>,
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
        header: () => <span className="text-zinc-500">Status</span>,
        meta: { headerClassName: "text-center", cellClassName: "text-center" },
        cell: ({ getValue }) => {
          const isClosed = getValue<boolean>();
          return isClosed ? (
            <Badge className="h-6 bg-white/10 text-zinc-400 border-white/10">
              <IconLock size={10} /> Closed
            </Badge>
          ) : (
            <Badge className="h-6 bg-emerald-500/15 text-emerald-400 border-emerald-500/20">
              <IconLockOpen size={10} /> Active
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: () => <span className="text-zinc-500 pr-6">Action</span>,
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
                  "h-7 gap-1.5 font-bold tracking-wide border transition-all",
                  isSelected
                    ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-zinc-200"
                    : "bg-[#1e1e22] text-zinc-400 border-white/10 hover:bg-white hover:text-black hover:border-white",
                )}
                onClick={() => handleSelectPeriod(p)}
                disabled={isSelectingThis}
              >
                {isSelectingThis ? (
                  <IconLoader2 size={14} className="animate-spin" />
                ) : isSelected ? (
                  <IconEyeOff size={14} />
                ) : (
                  <IconEye size={14} />
                )}
                {isSelected ? "VIEWING" : "VIEW"}
              </Button>

              {!p.isClosed && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 px-0 bg-transparent border border-transparent text-zinc-500 hover:text-white hover:bg-white/10 hover:border-white/10"
                  onClick={() => handleClosePeriod(p)}
                  disabled={isClosingThis}
                >
                  {isClosingThis ? (
                    <IconLoader2 size={14} className="animate-spin" />
                  ) : (
                    <IconLock size={14} />
                  )}
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [selectedPeriod, selectingId, closingId],
  );

  const table = useReactTable({
    data: periods,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2 text-white">
                <IconCalendar className="text-white" size={22} /> Accounting
                Periods
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                Period yang aktif akan dipakai di semua halaman
              </p>
            </div>
            <div className="flex gap-2">
              {selectedPeriod && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 bg-transparent border-white/15 text-zinc-300 hover:bg-white/10 hover:text-white"
                  onClick={handleClearSelection}
                  disabled={isClearing}
                >
                  {isClearing ? (
                    <IconLoader2 size={14} className="animate-spin" />
                  ) : (
                    <IconEyeOff size={14} />
                  )}{" "}
                  Stop Viewing
                </Button>
              )}
              <Button
                size="sm"
                className="gap-1.5 bg-white text-black hover:bg-zinc-200"
                onClick={() => setViewMode("create")}
              >
                <IconPlus size={14} /> Open New Period
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden bg-[#151519] border-white/[0.07]">
            <CardHeader className="flex-row items-center justify-between space-y-0 py-3 border-b border-white/[0.06]">
              <CardTitle className="text-sm text-white">Period List</CardTitle>
              <Badge
                variant="secondary"
                className="font-mono text-xs bg-white/10 text-zinc-300 border-white/10"
              >
                {periods.length} total
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow
                      key={headerGroup.id}
                      className="border-white/[0.06] hover:bg-transparent"
                    >
                      {headerGroup.headers.map((header) => {
                        const meta = header.column.columnDef.meta as
                          { headerClassName?: string } | undefined;
                        return (
                          <TableHead
                            key={header.id}
                            className={meta?.headerClassName}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow className="border-white/[0.06]">
                      <TableCell
                        colSpan={columns.length}
                        className="text-center py-8 text-zinc-500"
                      >
                        <IconLoader2
                          className="animate-spin inline mr-2"
                          size={16}
                        />{" "}
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => {
                      const p = row.original;
                      const isSelected = selectedPeriod?.id === p.id;
                      return (
                        <TableRow
                          key={row.id}
                          className={cn(
                            "border-white/[0.06] transition-colors",
                            isSelected
                              ? "bg-white/[0.06] hover:bg-white/[0.08] border-l-4 border-l-white"
                              : "hover:bg-white/[0.03]",
                            p.isClosed && !isSelected && "opacity-50",
                          )}
                        >
                          {row.getVisibleCells().map((cell) => {
                            const meta = cell.column.columnDef.meta as
                              { cellClassName?: string } | undefined;
                            return (
                              <TableCell
                                key={cell.id}
                                className={meta?.cellClassName}
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext(),
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow className="border-white/[0.06]">
                      <TableCell
                        colSpan={columns.length}
                        className="text-center py-12 text-zinc-500"
                      >
                        <IconCalendarOff className="mx-auto mb-2" size={28} />
                        <p className="font-medium text-zinc-300">
                          No periods yet
                        </p>
                        <p className="text-xs">
                          Click Open New Period to start
                        </p>
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
              onClick={() => setViewMode("list")}
            >
              <IconArrowLeft size={14} /> Back
            </Button>
          </div>
          <form onSubmit={handleCreateSubmit} className="space-y-6">
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
                    <IconLoader2
                      className="animate-spin inline mr-1"
                      size={14}
                    />{" "}
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
                          <Label className="text-zinc-300">
                            Retained Earnings
                          </Label>
                          <Select
                            value={retainedId}
                            onValueChange={setRetainedId}
                          >
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
                              onChange={(e) =>
                                setCashAccountCode(e.target.value)
                              }
                              className="bg-[#0e0e10] border-white/10 text-white"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-zinc-300">Cash Name</Label>
                            <Input
                              value={cashAccountName}
                              onChange={(e) =>
                                setCashAccountName(e.target.value)
                              }
                              className="bg-[#0e0e10] border-white/10 text-white"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-zinc-300">
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
                              className="bg-[#0e0e10] border-white/10 text-white"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-zinc-300">Bank Code</Label>
                            <Input
                              value={bankAccountCode}
                              onChange={(e) =>
                                setBankAccountCode(e.target.value)
                              }
                              className="bg-[#0e0e10] border-white/10 text-white"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-zinc-300">Bank Name</Label>
                            <Input
                              value={bankAccountName}
                              onChange={(e) =>
                                setBankAccountName(e.target.value)
                              }
                              className="bg-[#0e0e10] border-white/10 text-white"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-zinc-300">
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
                              className="bg-[#0e0e10] border-white/10 text-white"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-zinc-300">
                              Retained Code
                            </Label>
                            <Input
                              value={retainedCode}
                              onChange={(e) => setRetainedCode(e.target.value)}
                              className="bg-[#0e0e10] border-white/10 text-white"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-zinc-300">
                              Retained Name
                            </Label>
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
                onClick={() => setViewMode("list")}
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
      )}
    </div>
  );
}
