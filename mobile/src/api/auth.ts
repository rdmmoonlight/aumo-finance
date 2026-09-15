import { useMutation } from '@tanstack/react-query';
import { apiClient, tokenStorage } from '../../apiClient';

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  userId: string;
  fullName: string;
  token: string;
}

export const authService = {
  // POST /api/v1/auth/login -> body { email, password, rememberMe? }
  // Backend selalu login cookie (untuk web) SEKALIGUS menerbitkan JWT di
  // field "token" (untuk mobile) - lihat AuthController.cs. Mobile pakai
  // token itu, cookie-nya diabaikan.
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/api/v1/auth/login', payload);
    return response.data;
  },
  logout: async () => {
    await tokenStorage.removeToken();
  },
};

export const useLogin = () => {
  return useMutation({
    mutationFn: authService.login,
    onSuccess: async (data) => {
      if (data.token) {
        await tokenStorage.setToken(data.token);
      }
    },
  });
};
