// src/api/reports.ts
import { apiClient } from "@/api/client";
import { coreStore } from "@/core/store";
import type {
    DeleteJournalsAdjustingByIdApiArg,
    DeleteJournalsAdjustingByIdApiResponse,
    GetGeneralLedgerPermanentApiResponse,
    GetGeneralLedgerTemporaryApiResponse,
    GetIncomeStatementApiResponse,
    GetJournalsAdjustingApiResponse,
    GetJournalsClosingApiResponse,
    GetJournalsGeneralApiResponse,
    GetRetainedEarningsApiResponse,
    GetStatementOfCashFlowApiResponse,
    GetStatementOfFinancialPositionApiArg,
    GetStatementOfFinancialPositionApiResponse,
    GetSummaryApiResponse,
    GetTrialBalanceApiArg,
    GetTrialBalanceApiResponse,
    GetWorksheetApiResponse,
    RefreshGeneralLedgerApiResponse
} from "@/types/reports";

/**
 * GET /summary
 */
export function getSummary(): Promise<GetSummaryApiResponse> {
    return coreStore.fetchWithCache(
        "/summary",
        () => apiClient<GetSummaryApiResponse>("/summary"),
        { ttl: 60000, tags: ["Summary"] }
    );
}

/**
 * GET /reports/income-statement
 */
export function getIncomeStatement(): Promise<GetIncomeStatementApiResponse> {
    return coreStore.fetchWithCache(
        "/reports/income-statement",
        () => apiClient<GetIncomeStatementApiResponse>("/reports/income-statement"),
        { ttl: 300000, tags: ["FinancialStatements"] }
    );
}

/**
 * GET /reports/retained-earnings
 */
export function getRetainedEarnings(): Promise<GetRetainedEarningsApiResponse> {
    return coreStore.fetchWithCache(
        "/reports/retained-earnings",
        () => apiClient<GetRetainedEarningsApiResponse>("/reports/retained-earnings"),
        { ttl: 300000, tags: ["FinancialStatements"] }
    );
}

/**
 * GET /reports/statement-of-cash-flow
 */
export function getStatementOfCashFlow(): Promise<GetStatementOfCashFlowApiResponse> {
    return coreStore.fetchWithCache(
        "/reports/statement-of-cash-flow",
        () => apiClient<GetStatementOfCashFlowApiResponse>("/reports/statement-of-cash-flow"),
        { ttl: 300000, tags: ["FinancialStatements"] }
    );
}

/**
 * GET /reports/statement-of-financial-position
 */
export function getStatementOfFinancialPosition(
    arg?: GetStatementOfFinancialPositionApiArg
): Promise<GetStatementOfFinancialPositionApiResponse> {
    const query = arg?.isPostClosing !== undefined ? `?isPostClosing=${arg.isPostClosing}` : "";
    const cacheKey = `/reports/statement-of-financial-position${query}`;

    return coreStore.fetchWithCache(
        cacheKey,
        () => apiClient<GetStatementOfFinancialPositionApiResponse>(cacheKey),
        { ttl: 300000, tags: ["FinancialStatements"] }
    );
}

/**
 * GET /reports/general-ledgers/permanent
 */
export function getGeneralLedgerPermanent(): Promise<GetGeneralLedgerPermanentApiResponse> {
    return coreStore.fetchWithCache(
        "/reports/general-ledgers/permanent",
        () => apiClient<GetGeneralLedgerPermanentApiResponse>("/reports/general-ledgers/permanent"),
        { ttl: 120000, tags: ["GeneralLedgers"] }
    );
}

/**
 * GET /reports/general-ledgers/temporary
 */
export function getGeneralLedgerTemporary(): Promise<GetGeneralLedgerTemporaryApiResponse> {
    return coreStore.fetchWithCache(
        "/reports/general-ledgers/temporary",
        () => apiClient<GetGeneralLedgerTemporaryApiResponse>("/reports/general-ledgers/temporary"),
        { ttl: 120000, tags: ["GeneralLedgers"] }
    );
}

/**
 * POST /reports/general-ledgers/refresh
 */
export async function refreshGeneralLedger(): Promise<RefreshGeneralLedgerApiResponse> {
    const result = await apiClient<RefreshGeneralLedgerApiResponse>("/reports/general-ledgers/refresh", {
        method: "POST",
    });
    coreStore.invalidate(["GeneralLedgers"]);
    return result;
}

/**
 * GET /reports/journals/general
 */
export function getJournalsGeneral(): Promise<GetJournalsGeneralApiResponse> {
    return coreStore.fetchWithCache(
        "/reports/journals/general",
        () => apiClient<GetJournalsGeneralApiResponse>("/reports/journals/general"),
        { ttl: 120000, tags: ["Journals"] }
    );
}

/**
 * GET /reports/journals/adjusting
 */
export function getJournalsAdjusting(): Promise<GetJournalsAdjustingApiResponse> {
    return coreStore.fetchWithCache(
        "/reports/journals/adjusting",
        () => apiClient<GetJournalsAdjustingApiResponse>("/reports/journals/adjusting"),
        { ttl: 120000, tags: ["Journals"] }
    );
}

/**
 * DELETE /reports/journals/adjusting/{id}
 */
export async function deleteJournalsAdjustingById(
    arg: DeleteJournalsAdjustingByIdApiArg
): Promise<DeleteJournalsAdjustingByIdApiResponse> {
    const result = await apiClient<DeleteJournalsAdjustingByIdApiResponse>(`/reports/journals/adjusting/${arg.id}`, {
        method: "DELETE",
    });
    coreStore.invalidate(["Journals"]);
    return result;
}

/**
 * GET /reports/journals/closing
 */
export function getJournalsClosing(): Promise<GetJournalsClosingApiResponse> {
    return coreStore.fetchWithCache(
        "/reports/journals/closing",
        () => apiClient<GetJournalsClosingApiResponse>("/reports/journals/closing"),
        { ttl: 120000, tags: ["Journals"] }
    );
}

/**
 * GET /reports/trial-balances?type=unadjusted|adjusted|post-closing
 */
export function getTrialBalance(
    arg?: GetTrialBalanceApiArg
): Promise<GetTrialBalanceApiResponse> {
    const type = arg?.type ?? "unadjusted";
    const cacheKey = `/reports/trial-balances?type=${encodeURIComponent(type)}`;

    return coreStore.fetchWithCache(
        cacheKey,
        () => apiClient<GetTrialBalanceApiResponse>(cacheKey),
        { ttl: 120000, tags: ["TrialBalances"] }
    );
}

/**
 * GET /reports/worksheet
 */
export function getWorksheet(): Promise<GetWorksheetApiResponse> {
    return coreStore.fetchWithCache(
        "/reports/worksheet",
        () => apiClient<GetWorksheetApiResponse>("/reports/worksheet"),
        { ttl: 120000, tags: ["Worksheet"] }
    );
}