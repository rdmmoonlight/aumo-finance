"use client";

import { Calendar, EyeOff, Loader2, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { CreatePeriodForm } from "#/features/periods/components/open-new-period-form";
import type { ApiError, CreatePeriodValues, PeriodItem } from "#/features/periods/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { periodsApi } from "./hooks/usePeriods";

export default function PeriodsPage() {
    const [periods, setPeriods] = useState<PeriodItem[]>([]);
    const [openInfo, setOpenInfo] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingOpenInfo, setIsLoadingOpenInfo] = useState(true);
    const [isClearing, setIsClearing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [viewMode, setViewMode] = useState<"list" | "create">("list");
    const [selectingId, setSelectingId] = useState<number | null>(null);
    const [closingId, setClosingId] = useState<number | null>(null);
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
    const periodsQuery = periodsApi.useGetPeriods();
    const openInfoQuery = periodsApi.useGetPeriodsOpenInfo();
    const selectPeriodMutation = periodsApi.useSelectPeriod();
    const clearSelectionMutation = periodsApi.useClearSelection();
    const closePeriodMutation = periodsApi.useClosePeriod();
    const createPeriodMutation = periodsApi.useCreatePeriod();

    const fetchPeriods = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await periodsQuery.refetch();
            if (result.data) setPeriods(result.data);
        } catch {
            toast.error("Gagal memuat data periode.");
        } finally {
            setIsLoading(false);
        }
    }, [periodsQuery]);

    const fetchOpenInfo = useCallback(async () => {
        setIsLoadingOpenInfo(true);
        try {
            const result = await openInfoQuery.refetch();
            if (result.data) setOpenInfo(result.data);
        } catch { }
        finally { setIsLoadingOpenInfo(false); }
    }, [openInfoQuery]);

    useEffect(() => {
        const d = new Date();
        setMonth(d.getMonth() + 1);
        setYear(d.getFullYear());
        fetchPeriods();
        fetchOpenInfo();
    }, [fetchPeriods, fetchOpenInfo]);

    useEffect(() => {
        if (openInfo) {
            const exists = !!openInfo.hasExistingPermanentAccounts;
            setSetupMode(exists ? "LoadExisting" : "CreateNew");
            if (exists) {
                setCashAccountId(openInfo.availableCashAndBankAccounts?.[0]?.id?.toString() || "");
                setBankAccountId(openInfo.availableCashAndBankAccounts?.[1]?.id?.toString() || openInfo.availableCashAndBankAccounts?.[0]?.id?.toString() || "");
                setRetainedId(openInfo.availableRetainedEarningsAccounts?.[0]?.id?.toString() || "");
            }
        }
    }, [openInfo]);

    const selectedPeriod = useMemo(() => periods.find((p) => p.isSelected) || null, [periods]);

    const handleSelectPeriod = async (p: PeriodItem) => {
        setSelectingId(p.id);
        try {
            await selectPeriodMutation.mutateAsync({ id: p.id });
            toast.success(`Now viewing: ${p.periodName}`);
            await fetchPeriods();
        } catch (err) {
            toast.error((err as ApiError)?.data?.message || "Gagal memilih periode.");
        } finally { setSelectingId(null); }
    };

    const handleClearSelection = async () => {
        setIsClearing(true);
        try {
            await clearSelectionMutation.mutateAsync();
            toast.info("No period selected.");
            await fetchPeriods();
        } catch (err) {
            toast.error((err as ApiError)?.data?.message || "Gagal menghapus pilihan periode.");
        } finally { setIsClearing(false); }
    };

    const handleClosePeriod = async (p: PeriodItem) => {
        if (!confirm(`Close ${p.periodName}? This will lock all entries.`)) return;
        setClosingId(p.id);
        try {
            await closePeriodMutation.mutateAsync({ id: p.id });
            toast.success(`${p.periodName} closed successfully.`);
            await fetchPeriods();
        } catch (err) {
            toast.error((err as ApiError)?.data?.message || "Failed to close period.");
        } finally { setClosingId(null); }
    };

    const handleCreateSubmit = async (values?: CreatePeriodValues) => {
        const currentSetupMode = values?.setupMode ?? setupMode;
        if (currentSetupMode === "LoadExisting" && (!(values?.cashAccountId ?? cashAccountId) || !(values?.bankAccountId ?? bankAccountId) || !(values?.retainedId ?? retainedId))) {
            toast.warning("Select Cash, Bank, and Retained Earnings accounts.");
            return;
        }
        setIsCreating(true);
        try {
            await createPeriodMutation.mutateAsync({
                createPeriodRequest: {
                    month: Number(values?.month ?? month),
                    year: Number(values?.year ?? year),
                    setupMode: currentSetupMode,
                    cashAccountId: currentSetupMode === "LoadExisting" ? parseInt(values?.cashAccountId ?? cashAccountId, 10) : null,
                    bankAccountId: currentSetupMode === "LoadExisting" ? parseInt(values?.bankAccountId ?? bankAccountId, 10) : null,
                    retainedEarningsAccountId: currentSetupMode === "LoadExisting" ? parseInt(values?.retainedId ?? retainedId, 10) : null,
                    cashAccountCode: currentSetupMode === "CreateNew" ? (values?.cashAccountCode ?? cashAccountCode) : undefined,
                    cashAccountName: currentSetupMode === "CreateNew" ? (values?.cashAccountName ?? cashAccountName) : undefined,
                    cashBalance: currentSetupMode === "CreateNew" ? Number(values?.cashBalance ?? cashBalance) || 0 : undefined,
                    bankAccountCode: currentSetupMode === "CreateNew" ? (values?.bankAccountCode ?? bankAccountCode) : undefined,
                    bankAccountName: currentSetupMode === "CreateNew" ? (values?.bankAccountName ?? bankAccountName) : undefined,
                    bankBalance: currentSetupMode === "CreateNew" ? Number(values?.bankBalance ?? bankBalance) || 0 : undefined,
                    retainedEarningsAccountCode: currentSetupMode === "CreateNew" ? (values?.retainedCode ?? retainedCode) : undefined,
                    retainedEarningsAccountName: currentSetupMode === "CreateNew" ? (values?.retainedName ?? retainedName) : undefined,
                },
            });
            toast.success("Period opened successfully.");
            setViewMode("list");
            await fetchPeriods();
        } catch (err) {
            toast.error((err as ApiError)?.data?.message || "Failed to create period.");
        } finally { setIsCreating(false); }
    };

    return (
        <div className="space-y-6 max-w-5xl">
            {viewMode === "list" ? (
                <Card className="bg-[#151519] border-white/[0.07]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div>
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <Calendar className="text-white" size={20} /> Financial Periods
                            </CardTitle>
                            <CardDescription className="text-xs text-zinc-400 mt-1">Manage accounting cycles and period statuses</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            {selectedPeriod && (
                                <Button variant="outline" size="sm" onClick={handleClearSelection} disabled={isClearing} className="gap-1.5 bg-transparent border-white/10 text-xs text-zinc-300 hover:bg-white/10 hover:text-white">
                                    {isClearing ? <Loader2 size={14} className="animate-spin" /> : <EyeOff size={14} />} Clear Selection
                                </Button>
                            )}
                            <Button size="sm" onClick={() => setViewMode("create")} className="gap-1.5 bg-white text-black text-xs font-semibold hover:bg-zinc-200">
                                <Plus size={14} /> Open Period
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="border-t border-white/[0.07]">
                            <Table>
                                <TableHeader className="bg-[#0e0e10]">
                                    <TableRow className="border-b border-white/[0.07] hover:bg-transparent">
                                        <TableHead className="h-10 text-xs">Period</TableHead>
                                        <TableHead className="h-10 text-xs">Status</TableHead>
                                        <TableHead className="h-10 text-xs text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="h-24 text-center text-xs text-zinc-500">
                                                <Loader2 className="animate-spin inline mr-1" size={16} /> Loading periods...
                                            </TableCell>
                                        </TableRow>
                                    ) : periods.length > 0 ? (
                                        periods.map((p: any) => {
                                            const isSelected = selectedPeriod?.id === p.id;
                                            const isClosing = closingId === p.id;
                                            const isSelecting = selectingId === p.id;
                                            return (
                                                <TableRow key={p.id} className="border-b border-white/[0.05] hover:bg-white/[0.02]">
                                                    <TableCell className="py-3">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-medium text-white">{p.periodName || `${p.month}/${p.year}`}</span>
                                                            <span className="text- text-zinc-500">{p.month && p.year ? `${p.month}/${p.year}` : p.startDate || ""}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-3">
                                                        {isSelected ? (
                                                            <Badge className="bg-white text-black text-">Active</Badge>
                                                        ) : p.isClosed || p.status === "Closed" ? (
                                                            <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 text-">Closed</Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="border-white/10 text-zinc-300 text-">Open</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="py-3 text-right">
                                                        <div className="flex justify-end gap-1.5">
                                                            <Button
                                                                size="sm"
                                                                variant={isSelected ? "secondary" : "outline"}
                                                                disabled={isSelected || isSelecting}
                                                                onClick={() => handleSelectPeriod(p)}
                                                                className="h-7 text- bg-transparent border-white/10 hover:bg-white/10"
                                                            >
                                                                {isSelecting ? <Loader2 size={12} className="animate-spin" /> : "Select"}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                disabled={p.isClosed || isClosing}
                                                                onClick={() => handleClosePeriod(p)}
                                                                className="h-7 text- text-zinc-400 hover:text-white hover:bg-white/10"
                                                            >
                                                                {isClosing ? <Loader2 size={12} className="animate-spin" /> : "Close"}
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="h-24 text-center text-xs text-zinc-500">
                                                No financial periods found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <CreatePeriodForm
                    initialValues={{ month, year, setupMode, cashAccountId, bankAccountId, retainedId, cashAccountCode, cashAccountName, cashBalance, bankAccountCode, bankAccountName, bankBalance, retainedCode, retainedName }}
                    openInfo={openInfo}
                    isLoadingOpenInfo={isLoadingOpenInfo}
                    isCreating={isCreating}
                    setMonth={setMonth} setYear={setYear} setSetupMode={setSetupMode}
                    setCashAccountId={setCashAccountId} setBankAccountId={setBankAccountId} setRetainedId={setRetainedId}
                    setCashAccountCode={setCashAccountCode} setCashAccountName={setCashAccountName} setCashBalance={setCashBalance}
                    setBankAccountCode={setBankAccountCode} setBankAccountName={setBankAccountName} setBankBalance={setBankBalance}
                    setRetainedCode={setRetainedCode} setRetainedName={setRetainedName}
                    onSubmit={handleCreateSubmit}
                    onCancel={() => setViewMode("list")}
                />
            )}
        </div>
    );
}