// src/api/chart-of-accounts.ts
import { apiClient } from "@/api/client";
import { coreStore } from "@/core/store";
import type {
    CreateAccountRequest,
    DeleteChartOfAccountsByIdArg,
    GetChartOfAccountsArg,
    PutChartOfAccountsByIdArg
} from "@/types/chart-of-accounts";

/**
 * GET /chart-of-accounts
 */
export function getChartOfAccounts(arg?: GetChartOfAccountsArg): Promise<any> {
    const params = new URLSearchParams();

    if (arg?.search) params.append("search", arg.search);
    if (arg?.category) params.append("category", arg.category);

    const queryString = params.toString();
    const endpoint = `/chart-of-accounts${queryString ? `?${queryString}` : ""}`;

    return coreStore.fetchWithCache(
        endpoint,
        () => apiClient(endpoint),
        { ttl: 60000, tags: ["ChartOfAccounts"] }
    );
}

/**
 * POST /chart-of-accounts
 */
export async function createChartOfAccount(body: CreateAccountRequest): Promise<any> {
    const result = await apiClient("/chart-of-accounts", {
        method: "POST",
        body,
    });
    coreStore.invalidate(["ChartOfAccounts"]);
    return result;
}

/**
 * PUT /chart-of-accounts/{id}
 */
export async function updateChartOfAccount({
    id,
    updateAccountRequest,
}: PutChartOfAccountsByIdArg): Promise<any> {
    const result = await apiClient(`/chart-of-accounts/${id}`, {
        method: "PUT",
        body: updateAccountRequest,
    });
    coreStore.invalidate(["ChartOfAccounts"]);
    return result;
}

/**
 * DELETE /chart-of-accounts/{id}
 */
export async function deleteChartOfAccount({
    id,
}: DeleteChartOfAccountsByIdArg): Promise<any> {
    const result = await apiClient(`/chart-of-accounts/${id}`, {
        method: "DELETE",
    });
    coreStore.invalidate(["ChartOfAccounts"]);
    return result;
}