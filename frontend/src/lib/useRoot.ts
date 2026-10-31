import { apiClient } from "@/lib/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// --- Keys ---
export const rootKeys = {
    all: ["root"] as const,
    detail: () => [...rootKeys.all, "detail"] as const,
};

// GET /
export function useGetRoot() {
    return useQuery({
        queryKey: rootKeys.detail(),
        queryFn: async () => {
            const res = await apiClient.get("/");
            return res.data;
        },
    });
}

// HEAD /
export function useCheckRootHead() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const res = await apiClient.head("/");
            return res.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: rootKeys.all });
        },
    });
}
