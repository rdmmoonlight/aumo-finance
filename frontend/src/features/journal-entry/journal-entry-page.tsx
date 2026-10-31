"use client";

import { Link, useNavigate } from "@tanstack/react-router";
import {
    AlertTriangle,
    ArrowLeft,
    BookOpen,
    Edit,
    Loader2,
    Lock,
    Save,
} from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useAppRouter, useSearchParams } from "@/lib/router-compat";
import {
    journalEntrySchema,
    parseFormattedNumber,
} from "@/lib/validations/journal-entry";
import { chartOfAccountsApi } from "../chart-of-accounts/api/chartOfAccountsApi";
import { journalEntryApi } from "../journal-entry/api/journalEntryApi";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { JournalLinesTable } from "#/features/journal-entry/components/journal-lines-table";
import {
    AccountOption,
    LineItem,
    formatNumberWithDots,
} from "#/features/journal-entry/utils/helpers";

function JournalEntryContent() {
    const router = useAppRouter();
    const navigate = useNavigate();
    const searchParams = useSearchParams();
    const entryIdParam = searchParams.get("id");
    const isEdit = Boolean(entryIdParam);
    const entryId = entryIdParam ? parseInt(entryIdParam, 10) : 0;

    const [apiError, setApiError] = useState<string | null>(null);

    // Manual State untuk menggantikan React Hooks bawaan RTK Query
    const [isAccountsLoading, setIsAccountsLoading] = useState<boolean>(true);
    const [availableAccounts, setAvailableAccounts] = useState<AccountOption[]>([]);
    const accountsQuery =
        chartOfAccountsApi.endpoints.getChartOfAccounts.useQuery();

    const [isTxLoading, setIsTxLoading] = useState<boolean>(false);
    const [nextTxNumber, setNextTxNumber] = useState<string | null>(null);

    const [isEditLoading, setIsEditLoading] = useState<boolean>(isEdit);
    const [editData, setEditData] = useState<any>(null);

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<
        z.input<typeof journalEntrySchema>,
        any,
        z.output<typeof journalEntrySchema>
    >({
        resolver: zodResolver(journalEntrySchema),
        defaultValues: {
            journalType: "General",
            entryDate: new Date().toISOString().split("T")[0],
            lines: [
                { id: "1", accountId: 0, lineDescription: "", debit: "", credit: "" },
                { id: "2", accountId: 0, lineDescription: "", debit: "", credit: "" },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({ control, name: "lines" });
    const journalType = watch("journalType");
    const entryDate = watch("entryDate");
    const watchedLines = watch("lines");
    const nextTransactionNumberQuery =
        journalEntryApi.endpoints.getNextTransactionNumber.useQuery(
            { journalType, entryDate },
            { skip: isEdit }
        );
    const journalEntryQuery =
        journalEntryApi.endpoints.getJournalEntryById.useQuery(
            { id: entryId },
            { skip: !isEdit }
        );
    const [createJournalEntry] =
        journalEntryApi.endpoints.createJournalEntry.useMutation();
    const [updateJournalEntry] =
        (journalEntryApi.endpoints as any).updateJournalEntry.useMutation();

    // 1. Fetch Chart of Accounts
    useEffect(() => {
        setIsAccountsLoading(accountsQuery.isLoading);
        if (accountsQuery.error) {
            console.error("Failed to load accounts:", accountsQuery.error);
            toast.error("Gagal memuat Chart of Accounts");
            return;
        }

        if (accountsQuery.data) {
            const res: any = accountsQuery.data;
            let list: any[] = [];
            if (Array.isArray(res.accounts)) list = res.accounts;
            else if (Array.isArray(res.data)) list = res.data;
            else if (Array.isArray(res)) list = res;

            setAvailableAccounts(
                list.map((a: any) => ({
                    ...a,
                    id: Number(a.id || 0),
                    referenceNumber: a.referenceNumber ?? "",
                    accountName: a.accountName ?? "",
                }))
            );
        }
    }, [accountsQuery.data, accountsQuery.error, accountsQuery.isLoading]);

    // 2. Fetch Next Transaction Number (Untuk mode Create)
    useEffect(() => {
        setIsTxLoading(!isEdit && nextTransactionNumberQuery.isLoading);
        if (isEdit) return;

        if (nextTransactionNumberQuery.error) {
            console.error(
                "Failed to fetch next transaction number:",
                nextTransactionNumberQuery.error
            );
            return;
        }

        if (nextTransactionNumberQuery.data) {
            const raw: any = nextTransactionNumberQuery.data;
            const txNo =
                typeof raw === "string"
                    ? raw
                    : raw.transactionNumber ||
                    raw.nextTransactionNumber ||
                    raw.data ||
                    "";
            setNextTxNumber(txNo);
        }
    }, [isEdit, nextTransactionNumberQuery.data, nextTransactionNumberQuery.error, nextTransactionNumberQuery.isLoading]);

    // 3. Fetch Detail Journal Entry (Untuk mode Edit)
    useEffect(() => {
        if (!isEdit || isNaN(entryId)) return;
        setIsEditLoading(journalEntryQuery.isLoading);
        if (journalEntryQuery.error) {
            console.error("Failed to load journal entry:", journalEntryQuery.error);
            toast.error("Gagal memuat detail jurnal");
            return;
        }
        if (!journalEntryQuery.data) return;

        const resData: any = journalEntryQuery.data;
        setEditData(resData);
        const jData = resData.entry || resData.data || resData;
        if (jData && typeof jData === "object") {
            if (jData.journalType) setValue("journalType", jData.journalType);
            if (jData.entryDate)
                setValue("entryDate", jData.entryDate.split("T")[0]);
            if (Array.isArray(jData.lines) && jData.lines.length > 0) {
                setValue(
                    "lines",
                    jData.lines.map((l: any, i: number) => ({
                        id: l.id?.toString() || `${Date.now()}-${i}`,
                        accountId: Number(l.accountId || 0),
                        lineDescription: l.lineDescription || "",
                        debit: l.debit > 0 ? formatNumberWithDots(l.debit) : "",
                        credit: l.credit > 0 ? formatNumberWithDots(l.credit) : "",
                    }))
                );
            }
        }
    }, [
        isEdit,
        entryId,
        journalEntryQuery.data,
        journalEntryQuery.error,
        journalEntryQuery.isLoading,
        setValue,
    ]);

    const displayedTxNumber = useMemo(() => {
        if (isEdit)
            return (
                (editData?.entry || editData?.data || editData)?.transactionNumber ||
                "Loading..."
            );
        return nextTxNumber || "Loading...";
    }, [isEdit, editData, nextTxNumber]);

    const isLocked = Boolean(
        isEdit && (editData?.isLocked || editData?.entry?.isLocked)
    );

    const totalDebit = useMemo(
        () =>
            (watchedLines || []).reduce(
                (s, l) => s + parseFormattedNumber(l?.debit || ""),
                0
            ),
        [watchedLines]
    );

    const totalCredit = useMemo(
        () =>
            (watchedLines || []).reduce(
                (s, l) => s + parseFormattedNumber(l?.credit || ""),
                0
            ),
        [watchedLines]
    );

    const isBalanced = useMemo(
        () => totalDebit > 0 && totalDebit === totalCredit,
        [totalDebit, totalCredit]
    );

    const addLine = () =>
        append({
            id: `${Date.now()}-${Math.random()}`,
            accountId: 0,
            lineDescription: "",
            debit: "",
            credit: "",
        });

    const removeLine = (index: number) => {
        if (fields.length <= 2) {
            toast.warning("Minimal 2 baris jurnal wajib ada.");
            return;
        }
        setApiError(null);
        remove(index);
    };

    const handleAmountChange = (
        index: number,
        field: "debit" | "credit",
        value: string
    ) => {
        const formatted = formatNumberWithDots(value);
        setValue(`lines.${index}.${field}`, formatted, { shouldValidate: true });
        if (value !== "")
            setValue(`lines.${index}.${field === "debit" ? "credit" : "debit"}`, "", {
                shouldValidate: true,
            });
    };

    const resetForm = () => {
        reset({
            journalType: "General",
            entryDate: new Date().toISOString().split("T")[0],
            lines: [
                {
                    id: `${Date.now()}-1`,
                    accountId: 0,
                    lineDescription: "",
                    debit: "",
                    credit: "",
                },
                {
                    id: `${Date.now()}-2`,
                    accountId: 0,
                    lineDescription: "",
                    debit: "",
                    credit: "",
                },
            ],
        });
        setApiError(null);
    };

    const onSubmit: SubmitHandler<z.output<typeof journalEntrySchema>> = async (
        data
    ) => {
        setApiError(null);
        setIsSubmitting(true);

        const effective = data.lines.filter(
            (l) =>
                Number(l.accountId) > 0 &&
                (parseFormattedNumber(l.debit || "") > 0 ||
                    parseFormattedNumber(l.credit || "") > 0)
        );
        const payloadLines = effective.map((l) => ({
            accountId: Number(l.accountId),
            lineDescription: l.lineDescription || "",
            debit: parseFormattedNumber(l.debit || ""),
            credit: parseFormattedNumber(l.credit || ""),
        }));

        try {
            if (isEdit) {
                const res: any = await updateJournalEntry({
                    id: entryId,
                    body: {
                        entryDate: data.entryDate,
                        journalType: data.journalType,
                        transactionNumber: displayedTxNumber,
                        lines: payloadLines,
                    },
                }).unwrap();
                toast.success(`Updated ${res?.transactionNumber || displayedTxNumber}`);
                setTimeout(() => router.push("/reports/journals/general"), 1200);
            } else {
                const res: any = await createJournalEntry({
                    journalType: data.journalType,
                    entryDate: data.entryDate,
                    lines: payloadLines,
                }).unwrap();
                toast.success(
                    `Posted ${res?.transactionNumber || res?.data?.transactionNumber || displayedTxNumber}`
                );
                resetForm();
            }
        } catch (err: any) {
            const msg = err?.message || "An unexpected error occurred";
            setApiError(msg);
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isAccountsLoading || (isEdit && isEditLoading)) {
        return (
            <div className="flex flex-col items-center py-16 gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm">Loading...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        {isEdit ? (
                            <Edit className="text-primary" />
                        ) : (
                            <BookOpen className="text-primary" />
                        )}
                        {isEdit ? "Edit Journal Entry" : "Create Journal Entry"}
                        {isEdit && (
                            <Badge variant="secondary" className="font-mono text-xs">
                                {displayedTxNumber}
                            </Badge>
                        )}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Record double-entry transactions
                    </p>
                </div>
                <Button variant="outline" size="sm" asChild className="text-sm">
                    <Link to="/reports/journals/general" className="gap-1.5">
                        <ArrowLeft size={14} /> Back to Journal
                    </Link>
                </Button>
            </div>

            {(errors.lines || apiError) && (
                <Alert variant="destructive">
                    <AlertTriangle size={16} />
                    <AlertDescription className="text-xs">
                        <ul className="list-disc ml-4">
                            {errors.lines?.root?.message && (
                                <li>{errors.lines.root.message}</li>
                            )}
                            {apiError && <li>{apiError}</li>}
                        </ul>
                    </AlertDescription>
                </Alert>
            )}

            {isLocked ? (
                <Alert>
                    <Lock size={16} />
                    <AlertDescription className="text-xs">
                        Journal {displayedTxNumber} is in closed period.{" "}
                        <Link to="/reports/journals/general" className="underline">
                            Back
                        </Link>
                    </AlertDescription>
                </Alert>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold">
                                Transaction Info
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium flex items-center justify-between">
                                    <span>Transaction No.</span>
                                    {isTxLoading && (
                                        <Loader2
                                            size={12}
                                            className="animate-spin text-muted-foreground"
                                        />
                                    )}
                                </Label>
                                <Input
                                    className="h-9 font-mono bg-muted text-sm"
                                    value={displayedTxNumber}
                                    readOnly
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Journal Type</Label>
                                <Select
                                    value={watch("journalType")}
                                    onValueChange={(v) =>
                                        setValue("journalType", v, { shouldValidate: true })
                                    }
                                >
                                    <SelectTrigger className="h-9 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="text-sm">
                                        <SelectItem value="General">
                                            General Journal (GJ)
                                        </SelectItem>
                                        <SelectItem value="Adjusting">
                                            Adjusting Entry (AJ)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.journalType && (
                                    <p className="text-xs text-red-500 font-medium">
                                        {errors.journalType.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Date</Label>
                                <Input
                                    type="date"
                                    className="h-9 text-sm"
                                    {...register("entryDate")}
                                />
                                {errors.entryDate && (
                                    <p className="text-xs text-red-500 font-medium">
                                        {errors.entryDate.message}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <JournalLinesTable
                        fields={fields as LineItem[]}
                        availableAccounts={availableAccounts}
                        watchedLines={watchedLines}
                        register={register}
                        setValue={setValue}
                        totalDebit={totalDebit}
                        totalCredit={totalCredit}
                        isBalanced={isBalanced}
                        onAddLine={addLine}
                        onRemoveLine={removeLine}
                        onAmountChange={handleAmountChange}
                    />

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={resetForm}
                            className="text-sm"
                        >
                            Reset
                        </Button>
                        <Button
                            type="submit"
                            disabled={!isBalanced || isSubmitting}
                            className="gap-2 text-sm font-medium"
                        >
                            {isSubmitting ? (
                                <Loader2 className="animate-spin" size={16} />
                            ) : (
                                <Save size={16} />
                            )}
                            {isEdit ? "Save Changes" : "Post Journal Entry"}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default function JournalEntryPage() {
    return (
        <Suspense
            fallback={
                <div className="py-16 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={16} /> Loading...
                </div>
            }
        >
            <JournalEntryContent />
        </Suspense>
    );
}

function zodResolver<T extends z.ZodType<any, any, any>>(
    schema: T
): import("react-hook-form").Resolver<z.input<T>, any, z.output<T>> {
    return async (values) => {
        const result = await schema.safeParseAsync(values);

        if (result.success) {
            return { values: result.data, errors: {} };
        }

        const errors: Record<string, any> = {};
        for (const issue of result.error.issues) {
            const path = issue.path.map(String);
            let target: Record<string, any> = errors;

            if (path.length === 0) path.push("root");
            for (let i = 0; i < path.length - 1; i++) {
                const key = path[i];
                const nextKey = path[i + 1];
                if (!target[key]) {
                    target[key] = /^\d+$/.test(nextKey) ? [] : {};
                }
                target = target[key];
            }

            const key = path[path.length - 1];
            if (!target[key]) {
                target[key] = { type: issue.code, message: issue.message };
            }
        }

        return {
            values: {} as z.input<T>,
            errors: errors as import("react-hook-form").FieldErrors<z.input<T>>,
        };
    };
}
