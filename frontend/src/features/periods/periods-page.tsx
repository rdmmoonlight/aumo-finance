"use client";

import { getPeriodColumns } from "#/features/periods/components/columns";
import { CreatePeriodForm } from "#/features/periods/components/open-new-period-form";
import type { ApiError, CreatePeriodValues, PeriodItem } from "#/features/periods/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { store } from "@/lib/store";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { AlertTriangle, Calendar, EyeOff, Loader2, Plus, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { periodsApi } from "../periods/api/periodsApi";

export default function PeriodsPage() {
    const [periods, setPeriods] = useState<PeriodItem[]>([]);
    const [openInfo, setOpenInfo] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingOpenInfo, setIsLoadingOpenInfo] = useState(true);
    const [isClearing, setIsClearing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [viewMode, setViewMode] = useState<"list" | "create">("list");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
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

    const fetchPeriods = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await store.dispatch(periodsApi.endpoints.getPeriods.initiate(undefined, { forceRefetch: true }));
            if ("data" in result && result.data) {
                const rawData = result.data as any;
                setPeriods(Array.isArray(rawData) ? rawData : (rawData?.items || rawData?.periods || []));
            }
        } catch {
            setErrorMessage("Gagal memuat data periode.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchOpenInfo = useCallback(async () => {
        setIsLoadingOpenInfo(true);
        try {
            const result = await store.dispatch(periodsApi.endpoints.getPeriodsOpenInfo.initiate(undefined, { forceRefetch: true }));
            if ("data" in result && result.data) setOpenInfo(result.data);
        } catch { }
        finally { setIsLoadingOpenInfo(false); }
    }, []);

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
        setErrorMessage(null); setSelectingId(p.id);
        try {
            const result = await store.dispatch(periodsApi.endpoints.selectPeriod.initiate({ id: p.id }));
            if ("error" in result) throw result.error;
            setSuccessMessage(`Now viewing: ${p.periodName}`);
            await fetchPeriods();
        } catch (err) {
            setErrorMessage((err as ApiError)?.data?.message || "Gagal memilih periode.");
        } finally { setSelectingId(null); }
    };

    const handleClearSelection = async () => {
        setErrorMessage(null); setIsClearing(true);
        try {
            const result = await store.dispatch(periodsApi.endpoints.clearSelection.initiate());
            if ("error" in result) throw result.error;
            setSuccessMessage("No period selected.");
            await fetchPeriods();
        } catch (err) {
            setErrorMessage((err as ApiError)?.data?.message || "Gagal menghapus pilihan periode.");
        } finally { setIsClearing(false); }
    };

    const handleClosePeriod = async (p: PeriodItem) => {
        if (!confirm(`Close ${p.periodName}? This will lock all entries.`)) return;
        setErrorMessage(null); setClosingId(p.id);
        try {
            const result = await store.dispatch(periodsApi.endpoints.closePeriod.initiate({ id: p.id }));
            if ("error" in result) throw result.error;
            setSuccessMessage(`${p.periodName} closed successfully.`);
            await fetchPeriods();
        } catch (err) {
            setErrorMessage((err as ApiError)?.data?.message || "Failed to close period.");
        } finally { setClosingId(null); }
    };

    const handleCreateSubmit = async (values?: CreatePeriodValues) => {
        setErrorMessage(null);
        const currentSetupMode = values?.setupMode ?? setupMode;
        if (currentSetupMode === "LoadExisting" && (!(values?.cashAccountId ?? cashAccountId) || !(values?.bankAccountId ?? bankAccountId) || !(values?.retainedId ?? retainedId))) {
            setErrorMessage("Select Cash, Bank, and Retained Earnings accounts."); return;
        }
        setIsCreating(true);
        try {
            const result = await store.dispatch(periodsApi.endpoints.createPeriod.initiate({
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
            }));
            if ("error" in result) throw result.error;
            setSuccessMessage("Period opened successfully.");
            setViewMode("list");
            await fetchPeriods();
        } catch (err) {
            setErrorMessage((err as ApiError)?.data?.message || "Failed to create period.");
        } finally { setIsCreating(false); }
    };

    const columns = useMemo(() => getPeriodColumns({ selectedPeriod, selectingId, closingId, onSelectPeriod: handleSelectPeriod, onClosePeriod: handleClosePeriod }), [selectedPeriod, selectingId, closingId]);
    const table = useReactTable({ data: periods, columns, getCoreRowModel: getCoreRowModel() });

    return (
        <div className="space-y-6 max-w-5xl">
            {errorMessage && (
                <Alert variant="destructive" className="flex justify-between items-center py-2 bg-red-950/50 border-red-900/50 text-red-200">
                    <AlertDescription className="flex items-center gap-2 text-xs"><AlertTriangle size={16} /> {errorMessage}</AlertDescription>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-200 hover:bg-red-900/30" onClick={() => setErrorMessage(null)}><X size={14} /></Button>
                </Alert>
            )}
            {successMessage && (
                <Alert className="bg-white/[0.06] border-white/10 text-white flex justify-between items-center py-2">
                    <AlertDescription className="text-xs">{successMessage}</AlertDescription>
                    <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-white/10 text-white" onClick={() => setSuccessMessage(null)}><X size={14} /></Button>
                </Alert>
            )}

            {viewMode === "list" ? (
                <Card className="bg-[#151519] border-white/[0.07]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div>
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2"><Calendar className="text-white" size={20} /> Financial Periods</CardTitle>
                            <CardDescription className="text-xs text-zinc-400 mt-1">Manage accounting cycles and period statuses</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            {selectedPeriod && (
                                <Button variant="outline" size="sm" onClick={handleClearSelection} disabled={isClearing} className="gap-1.5 bg-transparent border-white/10 text-xs text-zinc-300 hover:bg-white/10 hover:text-white">
                                    {isClearing ? <Loader2 size={14} className="animate-spin" /> : <EyeOff size={14} />} Clear Selection
                                </Button>
                            )}
                            <Button size="sm" onClick={() => setViewMode("create")} className="gap-1.5 bg-white text-black text-xs font-semibold hover:bg-zinc-200"><Plus size={14} /> Open Period</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="border-t border-white/[0.07]">
                            <Table>
                                <TableHeader className="bg-[#0e0e10]">
                                    {table.getHeaderGroups().map((hg) => (
                                        <TableRow key={hg.id} className="border-b border-white/[0.07] hover:bg-transparent">
                                            {hg.headers.map((h) => (<TableHead key={h.id} className="h-10 text-xs">{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>))}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow><TableCell colSpan={columns.length} className="h-24 text-center text-xs text-zinc-500"><Loader2 className="animate-spin inline mr-1" size={16} /> Loading periods...</TableCell></TableRow>
                                    ) : table.getRowModel().rows.length > 0 ? (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow key={row.id} className="border-b border-white/[0.05] hover:bg-white/[0.02]">
                                                {row.getVisibleCells().map((cell) => (<TableCell key={cell.id} className="py-3 text-xs">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow><TableCell colSpan={columns.length} className="h-24 text-center text-xs text-zinc-500">No financial periods found.</TableCell></TableRow>
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