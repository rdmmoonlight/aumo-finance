import { apiClient } from "@/lib/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type GetGeneralLedgerPermanentApiResponse = {
    success: boolean;
    hasPeriodSelected: boolean;
    selectedPeriodName?: string;
    isTemporary: boolean;
    message?: string;
    accounts?: Array<any>;
};

export type GetGeneralLedgerTemporaryApiResponse = {
    success: boolean;
    hasPeriodSelected: boolean;
    selectedPeriodName?: string;
    isTemporary: boolean;
    netIncomeBeforeClosing?: number;
    message?: string;
    accounts?: Array<any>;
};

export type RefreshGeneralLedgerApiResponse = {
    success: boolean;
    message?: string;
    [key: string]: any;
};

export const generalLedgersKeys = {
    all: ["GeneralLedgers"] as const,
    permanent: () => [...generalLedgersKeys.all, "permanent"] as const,
    temporary: () => [...generalLedgersKeys.all, "temporary"] as const,
};

// GET /reports/general-ledgers/permanent
export function useGetGeneralLedgerPermanent() {
    return useQuery({
        queryKey: generalLedgersKeys.permanent(),
        queryFn: async (): Promise<GetGeneralLedgerPermanentApiResponse> => {
            const res = await apiClient.get("/reports/general-ledgers/permanent");
            return res.data as GetGeneralLedgerPermanentApiResponse;
        },
    });
}

// GET /reports/general-ledgers/temporary
export function useGetGeneralLedgerTemporary() {
    return useQuery({
        queryKey: generalLedgersKeys.temporary(),
        queryFn: async (): Promise<GetGeneralLedgerTemporaryApiResponse> => {
            const res = await apiClient.get("/reports/general-ledgers/temporary");
            return res.data as GetGeneralLedgerTemporaryApiResponse;
        },
    });
}

// POST /reports/general-ledgers/refresh
export function useRefreshGeneralLedger() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (): Promise<RefreshGeneralLedgerApiResponse> => {
            const res = await apiClient.post("/reports/general-ledgers/refresh");
            return res.data as RefreshGeneralLedgerApiResponse;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: generalLedgersKeys.all });
        },
    });
}
