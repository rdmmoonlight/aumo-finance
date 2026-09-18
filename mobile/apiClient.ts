import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { CONFIG } from "./config";

// Key untuk menyimpan token JWT
const TOKEN_KEY = CONFIG.TOKEN_KEY;

// Helper fungsi untuk mengelola token di SecureStore
export const tokenStorage = {
  getToken: async () => {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error("Error reading auth token:", error);
      return null;
    }
  },
  setToken: async (token: string) => {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
      console.error("Error saving auth token:", error);
    }
  },
  removeToken: async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error("Error removing auth token:", error);
    }
  },
};

// Inisialisasi Instance Axios
export const apiClient = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  timeout: CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Menambahkan Bearer Token ke Authorization Header
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await tokenStorage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Menangani 401 Unauthorized & Redirect ke Auth
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Hapus token yang invalid/expired dari SecureStore
      await tokenStorage.removeToken();

      // Redirect ke layar login/auth menggunakan Expo Router
      router.replace("/(auth)/login");
    }
    return Promise.reject(error);
  },
);
