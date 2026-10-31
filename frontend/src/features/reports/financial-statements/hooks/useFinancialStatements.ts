import { apiClient } from "@/lib/apiClient";
import { useQuery } from "@tanstack/react-query";

export type GetIncomeStatementApiResponse = any;
export type GetRetainedEarningsApiResponse = any;
export type GetStatementOfCashFlowApiResponse = any;
export type GetStatementOfFinancialPositionApiResponse = any;
export type GetStatementOfFinancialPositionApiArg = {
    isPostClosing?: boolean;
};

export const financialStatementsKeys = {
    all: ["FinancialStatements"] as const,
    incomeStatement: () => [...financialStatementsKeys.all, "income-statement"] as const,
    retainedEarnings: () => [...financialStatementsKeys.all, "retained-earnings"] as const,
    cashFlow: () => [...financialStatementsKeys.all, "cash-flow"] as const,
    financialPosition: (arg?: GetStatementOfFinancialPositionApiArg) =>
        [...financialStatementsKeys.all, "financial-position", arg ?? {}] as const,
};

// GET /reports/income-statement
export function useGetIncomeStatement() {
    return useQuery({
        queryKey: financialStatementsKeys.incomeStatement(),
        queryFn: async (): Promise<GetIncomeStatementApiResponse> => {
            const res = await apiClient.get("/reports/income-statement");
            return res.data;
        },
    });
}

// GET /reports/retained-earnings
export function useGetRetainedEarnings() {
    return useQuery({
        queryKey: financialStatementsKeys.retainedEarnings(),
        queryFn: async (): Promise<GetRetainedEarningsApiResponse> => {
            const res = await apiClient.get("/reports/retained-earnings");
            return res.data;
        },
    });
}

// GET /reports/statement-of-cash-flow
export function useGetStatementOfCashFlow() {
    return useQuery({
        queryKey: financialStatementsKeys.cashFlow(),
        queryFn: async (): Promise<GetStatementOfCashFlowApiResponse> => {
            const res = await apiClient.get("/reports/statement-of-cash-flow");
            return res.data;
        },
    });
}

// GET /reports/statement-of-financial-position?isPostClosing=
export function useGetStatementOfFinancialPosition(arg?: GetStatementOfFinancialPositionApiArg) {
    return useQuery({
        queryKey: financialStatementsKeys.financialPosition(arg),
        queryFn: async (): Promise<GetStatementOfFinancialPositionApiResponse> => {
            const res = await apiClient.get("/reports/statement-of-financial-position", {
                params: { isPostClosing: arg?.isPostClosing },
            });
            return res.data;
        },
    });
}
