import { apiClient } from "@/lib/apiClient";
import { useQuery } from "@tanstack/react-query";

export type GetWorksheetApiResponse = any;

export const worksheetKeys = {
    all: ["Worksheet"] as const,
    detail: () => [...worksheetKeys.all, "detail"] as const,
};

// GET /reports/worksheet
export function useGetWorksheet() {
    return useQuery({
        queryKey: worksheetKeys.detail(),
        queryFn: async (): Promise<GetWorksheetApiResponse> => {
            const res = await apiClient.get("/reports/worksheet");
            return res.data;
        },
    });
}
