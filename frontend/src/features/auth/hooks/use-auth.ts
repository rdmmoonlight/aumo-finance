import { apiClient } from "@/lib/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// --- Types Request & Response ---
export interface LoginRequest {
	email: string;
	password?: string;
	rememberMe?: boolean;
	isMobileClient?: boolean;
	userAgent?: string;
	operatingSystem?: string;
}

export interface GoogleLoginRequest {
	idToken: string;
	isMobileClient?: boolean;
}

export interface AuthResponse {
	success: boolean;
	message: string;
	userId?: string;
	fullName?: string;
	avatarUrl?: string;
	lockoutEnd?: string;
	errors?: string[];
}

export interface UserProfileData {
	id: string;
	userId: string;
	email: string;
	userName: string;
	fullName: string;
	phoneNumber?: string;
	avatarUrl?: string;
	bio?: string;
	roles: string[];
	customClaims: Record<string, unknown>[];
}

export interface ProfileResponse {
	success: boolean;
	data: UserProfileData;
	message?: string;
}

export interface CommonActionResponse {
	success: boolean;
	message: string;
}

// --- Query Keys ---
export const authKeys = {
	all: ["auth"] as const,
	profile: () => [...authKeys.all, "profile"] as const,
};

// ============================================================================
// --- MAIN WRAPPER HOOK ---
// ============================================================================

export function useAuth() {
	const queryClient = useQueryClient();

	// 1. Get Profile Query
	const profileQuery = useQuery({
		queryKey: authKeys.profile(),
		queryFn: async () => {
			const { data } = await apiClient.get<ProfileResponse>("/auth/me");
			return data;
		},
	});

	// 2. Login Mutation
	const loginMutation = useMutation({
		mutationFn: async (payload: LoginRequest) => {
			const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: authKeys.all });
		},
	});

	// 3. Google Login Mutation
	const googleLoginMutation = useMutation({
		mutationFn: async (payload: GoogleLoginRequest) => {
			const { data } = await apiClient.post<AuthResponse>("/auth/google-login", payload);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: authKeys.all });
		},
	});

	// 4. Logout Mutation
	const logoutMutation = useMutation({
		mutationFn: async () => {
			const { data } = await apiClient.post<CommonActionResponse>("/auth/logout");
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: authKeys.all });
			queryClient.resetQueries({ queryKey: authKeys.all });
		},
	});

	return {
		// Data & Profile States
		user: profileQuery.data?.data,
		profile: profileQuery.data,
		isLoadingProfile: profileQuery.isPending,
		isProfileError: profileQuery.isError,
		refetchProfile: profileQuery.refetch,

		// Actions (Mutations)
		login: loginMutation.mutateAsync,
		isLoggingIn: loginMutation.isPending,
		loginError: loginMutation.error,

		googleLogin: googleLoginMutation.mutateAsync,
		isGoogleLoggingIn: googleLoginMutation.isPending,

		logout: logoutMutation.mutateAsync,
		isLoggingOut: logoutMutation.isPending,
	};
}
