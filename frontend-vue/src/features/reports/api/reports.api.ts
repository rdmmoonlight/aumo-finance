import {
    deleteApiV1ReportsJournalsAdjustingById,
    getApiV1ReportsGeneralLedgersPermanent,
    getApiV1ReportsGeneralLedgersTemporary,
    getApiV1ReportsIncomeStatement,
    getApiV1ReportsJournalsAdjusting,
    getApiV1ReportsJournalsClosing,
    getApiV1ReportsJournalsGeneral,
    getApiV1ReportsRetainedEarnings,
    getApiV1ReportsStatementOfCashFlow,
    getApiV1ReportsStatementOfFinancialPosition,
    getApiV1ReportsTrialBalances,
    getApiV1ReportsWorksheet,
    getApiV1Summary,
    postApiV1ReportsGeneralLedgersRefresh,
} from "@/lib/generated";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

// --- Tipe ---
// Generated belum punya skema respons; tipe di bawah mengikuti bentuk yang dipakai UI
export type TrialBalanceType = "unadjusted" | "adjusted" | "post-closing";

export interface StatementOfFinancialPositionParams {
    isPostClosing?: boolean;
}

export interface GetTrialBalanceParams {
    type?: TrialBalanceType;
}

export interface GetGeneralLedgerPermanentResponse {
    success: boolean;
    hasPeriodSelected: boolean;
    selectedPeriodName?: string;
    isTemporary: boolean;
    message?: string;
    accounts?: Array<any>;
}

export interface GetGeneralLedgerTemporaryResponse {
    success: boolean;
    hasPeriodSelected: boolean;
    selectedPeriodName?: string;
    isTemporary: boolean;
    netIncomeBeforeClosing?: number;
    message?: string;
    accounts?: Array<any>;
}

export interface RefreshGeneralLedgerResponse {
    success: boolean;
    message?: string;
    [key: string]: any;
}

export type SummaryResponse = any;

// --- Query keys ---
export const reportsKeys = {
    all: ["reports"] as const,
    summary: ["reports", "summary"] as const,
    financialStatements: ["reports", "financial-statements"] as const,
    incomeStatement: ["reports", "financial-statements", "income-statement"] as const,
    retainedEarnings: ["reports", "financial-statements", "retained-earnings"] as const,
    cashFlow: ["reports", "financial-statements", "cash-flow"] as const,
    financialPosition: (params?: StatementOfFinancialPositionParams) =>
        ["reports", "financial-statements", "financial-position", params ?? {}] as const,
    generalLedgers: ["reports", "general-ledgers"] as const,
    generalLedgerPermanent: ["reports", "general-ledgers", "permanent"] as const,
    generalLedgerTemporary: ["reports", "general-ledgers", "temporary"] as const,
    journals: ["reports", "journals"] as const,
    journalsGeneral: ["reports", "journals", "general"] as const,
    journalsAdjusting: ["reports", "journals", "adjusting"] as const,
    journalsClosing: ["reports", "journals", "closing"] as const,
    trialBalances: (params?: GetTrialBalanceParams) =>
        ["reports", "trial-balances", params?.type ?? "unadjusted"] as const,
    worksheet: ["reports", "worksheet"] as const,
};

// --- Fungsi API murni ---
export async function getSummaryApi(signal?: AbortSignal) {
    const { data } = await getApiV1Summary({ signal, throwOnError: true });
    return data as SummaryResponse;
}

export async function getIncomeStatementApi(signal?: AbortSignal) {
    const { data } = await getApiV1ReportsIncomeStatement({
        signal,
        throwOnError: true,
    });
    return data as any;
}

export async function getRetainedEarningsApi(signal?: AbortSignal) {
    const { data } = await getApiV1ReportsRetainedEarnings({
        signal,
        throwOnError: true,
    });
    return data as any;
}

export async function getStatementOfCashFlowApi(signal?: AbortSignal) {
    const { data } = await getApiV1ReportsStatementOfCashFlow({
        signal,
        throwOnError: true,
    });
    return data as any;
}

export async function getStatementOfFinancialPositionApi(
    params?: StatementOfFinancialPositionParams,
    signal?: AbortSignal,
) {
    const { data } = await getApiV1ReportsStatementOfFinancialPosition({
        query: { isPostClosing: params?.isPostClosing },
        signal,
        throwOnError: true,
    });
    return data as any;
}

export async function getGeneralLedgerPermanentApi(signal?: AbortSignal) {
    const { data } = await getApiV1ReportsGeneralLedgersPermanent({
        signal,
        throwOnError: true,
    });
    return data as GetGeneralLedgerPermanentResponse;
}

export async function getGeneralLedgerTemporaryApi(signal?: AbortSignal) {
    const { data } = await getApiV1ReportsGeneralLedgersTemporary({
        signal,
        throwOnError: true,
    });
    return data as GetGeneralLedgerTemporaryResponse;
}

export async function refreshGeneralLedgerApi() {
    const { data } = await postApiV1ReportsGeneralLedgersRefresh({
        throwOnError: true,
    });
    return data as RefreshGeneralLedgerResponse;
}

export async function getJournalsGeneralApi(signal?: AbortSignal) {
    const { data } = await getApiV1ReportsJournalsGeneral({
        signal,
        throwOnError: true,
    });
    return data as any;
}

export async function getJournalsAdjustingApi(signal?: AbortSignal) {
    const { data } = await getApiV1ReportsJournalsAdjusting({
        signal,
        throwOnError: true,
    });
    return data as any;
}

export async function deleteJournalsAdjustingByIdApi({ id }: { id: number }) {
    const { data } = await deleteApiV1ReportsJournalsAdjustingById({
        path: { id },
        throwOnError: true,
    });
    return data as any;
}

export async function getJournalsClosingApi(signal?: AbortSignal) {
    const { data } = await getApiV1ReportsJournalsClosing({
        signal,
        throwOnError: true,
    });
    return data as any;
}

export async function getTrialBalanceApi(
    params?: GetTrialBalanceParams,
    signal?: AbortSignal,
) {
    const { data } = await getApiV1ReportsTrialBalances({
        query: { type: params?.type ?? "unadjusted" },
        signal,
        throwOnError: true,
    });
    return data as any;
}

export async function getWorksheetApi(signal?: AbortSignal) {
    const { data } = await getApiV1ReportsWorksheet({
        signal,
        throwOnError: true,
    });
    return data as any;
}

// --- Composables (query) ---
export function useGetSummaryQuery() {
    return useQuery({
        queryKey: reportsKeys.summary,
        queryFn: ({ signal }) => getSummaryApi(signal),
    });
}

export function useGetIncomeStatementQuery() {
    return useQuery({
        queryKey: reportsKeys.incomeStatement,
        queryFn: ({ signal }) => getIncomeStatementApi(signal),
    });
}

export function useGetRetainedEarningsQuery() {
    return useQuery({
        queryKey: reportsKeys.retainedEarnings,
        queryFn: ({ signal }) => getRetainedEarningsApi(signal),
    });
}

export function useGetStatementOfCashFlowQuery() {
    return useQuery({
        queryKey: reportsKeys.cashFlow,
        queryFn: ({ signal }) => getStatementOfCashFlowApi(signal),
    });
}

export function useGetStatementOfFinancialPositionQuery(
    params?: MaybeRefOrGetter<StatementOfFinancialPositionParams | undefined>,
) {
    return useQuery({
        queryKey: computed(() => reportsKeys.financialPosition(toValue(params))),
        queryFn: ({ signal }) =>
            getStatementOfFinancialPositionApi(toValue(params), signal),
    });
}

export function useGetGeneralLedgerPermanentQuery() {
    return useQuery({
        queryKey: reportsKeys.generalLedgerPermanent,
        queryFn: ({ signal }) => getGeneralLedgerPermanentApi(signal),
    });
}

export function useGetGeneralLedgerTemporaryQuery() {
    return useQuery({
        queryKey: reportsKeys.generalLedgerTemporary,
        queryFn: ({ signal }) => getGeneralLedgerTemporaryApi(signal),
    });
}

export function useGetJournalsGeneralQuery() {
    return useQuery({
        queryKey: reportsKeys.journalsGeneral,
        queryFn: ({ signal }) => getJournalsGeneralApi(signal),
    });
}

export function useGetJournalsAdjustingQuery() {
    return useQuery({
        queryKey: reportsKeys.journalsAdjusting,
        queryFn: ({ signal }) => getJournalsAdjustingApi(signal),
    });
}

export function useGetJournalsClosingQuery() {
    return useQuery({
        queryKey: reportsKeys.journalsClosing,
        queryFn: ({ signal }) => getJournalsClosingApi(signal),
    });
}

export function useGetTrialBalanceQuery(
    params?: MaybeRefOrGetter<GetTrialBalanceParams | undefined>,
) {
    return useQuery({
        queryKey: computed(() => reportsKeys.trialBalances(toValue(params))),
        queryFn: ({ signal }) => getTrialBalanceApi(toValue(params), signal),
    });
}

export function useGetWorksheetQuery() {
    return useQuery({
        queryKey: reportsKeys.worksheet,
        queryFn: ({ signal }) => getWorksheetApi(signal),
    });
}

// --- Composables (mutation) ---
export function useRefreshGeneralLedgerMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: refreshGeneralLedgerApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: reportsKeys.generalLedgers });
        },
    });
}

export function useDeleteJournalsAdjustingByIdMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteJournalsAdjustingByIdApi,
        onSuccess: () => {
            // Jurnal penyesuaian memengaruhi neraca saldo, kertas kerja, dan laporan keuangan
            queryClient.invalidateQueries({ queryKey: reportsKeys.all });
        },
    });
}
