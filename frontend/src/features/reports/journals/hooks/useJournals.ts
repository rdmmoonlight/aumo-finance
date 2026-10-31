import { apiClient } from "@/lib/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type GetJournalsGeneralApiResponse = any;
export type GetJournalsAdjustingApiResponse = any;
export type GetJournalsClosingApiResponse = any;
export type DeleteJournalsAdjustingByIdApiResponse = any;

export const journalsKeys = {
    all: ["Journals"] as const,
    general: () => [...journalsKeys.all, "general"] as const,
    adjusting: () => [...journalsKeys.all, "adjusting"] as const,
    closing: () => [...journalsKeys.all, "closing"] as const,
};

// GET /reports/journals/general
export function useGetJournalsGeneral() {
    return useQuery({
        queryKey: journalsKeys.general(),
        queryFn: async (): Promise<GetJournalsGeneralApiResponse> => {
            const res = await apiClient.get("/reports/journals/general");
            return res.data;
        },
    });
}

// GET /reports/journals/adjusting
export function useGetJournalsAdjusting() {
    return useQuery({
        queryKey: journalsKeys.adjusting(),
        queryFn: async (): Promise<GetJournalsAdjustingApiResponse> => {
            const res = await apiClient.get("/reports/journals/adjusting");
            return res.data;
        },
    });
}

// GET /reports/journals/closing
export function useGetJournalsClosing() {
    return useQuery({
        queryKey: journalsKeys.closing(),
        queryFn: async (): Promise<GetJournalsClosingApiResponse> => {
            const res = await apiClient.get("/reports/journals/closing");
            return res.data;
        },
    });
}

// DELETE /reports/journals/adjusting/{id}
export function useDeleteJournalsAdjustingById() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: number | string): Promise<DeleteJournalsAdjustingByIdApiResponse> => {
            const res = await apiClient.delete(`/reports/journals/adjusting/${id}`);
            return res.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: journalsKeys.all });
        },
    });
}
