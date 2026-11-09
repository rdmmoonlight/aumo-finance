import api from "@/lib/api";
import type {
    GoogleLoginRequest,
    LoginRequest,
} from "@/lib/generated/types.gen";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";

// 1. Query keys, pengganti providesTags / invalidatesTags
export const authKeys = {
    all: ["auth"] as const,
    profile: ["auth", "profile"] as const,
};

// 2. Fungsi API murni, gampang di-test tanpa Vue Query
export async function loginApi(body: LoginRequest) {
    const { data } = await api.post("/auth/login", body);
    return data;
}

export async function googleLoginApi(body: GoogleLoginRequest) {
    const { data } = await api.post("/auth/google-login", body);
    return data;
}

export async function getProfileApi() {
    const { data } = await api.get("/auth/me");
    return data;
}

export async function logoutApi() {
    const { data } = await api.post("/auth/logout");
    return data;
}

// 3. Composables, nama sama persis kayak hook RTK Query sebelumnya
export function useLoginMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: loginApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: authKeys.all });
        },
    });
}

export function useGoogleLoginMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: googleLoginApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: authKeys.all });
        },
    });
}

export function useGetProfileQuery() {
    return useQuery({
        queryKey: authKeys.profile,
        queryFn: getProfileApi,
    });
}

export function useLogoutMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: logoutApi,
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: authKeys.all });
        },
    });
}