import { create } from "zustand";
import axios from "axios";
import apiClient from "@/lib/apiClient";

// ============================================================================
// TYPES & INTERFACES (Menyesuaikan DTO Backend C#)
// ============================================================================

export interface PeriodItem {
  id: number;
  periodName: string;
  startDate: string;
  endDate: string;
  isClosed: boolean;
  isSelected: boolean;
}

export interface AccountOption {
  id: number;
  referenceNumber: number;
  accountName: string;
  type?: string;
  displayLabel?: string;
}

export interface OpenPeriodInfoResponse {
  hasExistingPermanentAccounts: boolean;
  availableCashAndBankAccounts: AccountOption[];
  availableRetainedEarningsAccounts: AccountOption[];
  permanentAccounts: AccountOption[];
}

export interface CreatePeriodPayload {
  month: number; // 1 - 12
  year: number; // 2000 - 2100
  setupMode: "LoadExisting" | "CreateNew" | string;

  // Fields untuk Setup Mode "LoadExisting"
  cashAccountId?: number | null;
  bankAccountId?: number | null;
  retainedEarningsAccountId?: number | null;

  // Fields untuk Setup Mode "CreateNew"
  cashAccountCode?: string;
  cashAccountName?: string;
  cashBalance?: number;

  bankAccountCode?: string;
  bankAccountName?: string;
  bankBalance?: number;

  retainedEarningsAccountCode?: string;
  retainedEarningsAccountName?: string;
}

interface PeriodState {
  // State Utama
  periods: PeriodItem[];
  selectedPeriod: PeriodItem | null;
  openInfo: OpenPeriodInfoResponse | null;

  // State Status UX
  loading: boolean;
  creating: boolean;
  error: string | null;

  // Actions / Methods
  fetchPeriods: () => Promise<void>;
  fetchOpenInfo: () => Promise<OpenPeriodInfoResponse | null>;
  createPeriod: (
    payload: CreatePeriodPayload,
  ) => Promise<{ success: boolean; message?: string }>;
  selectPeriod: (id: number) => Promise<boolean>;
  clearSelection: () => Promise<boolean>;
  closePeriod: (id: number) => Promise<{ success: boolean; message?: string }>;
  clearError: () => void;
}

// Helper untuk mengekstrak pesan error dari Axios Response
const extractErrorMessage = (err: unknown, defaultMsg: string): string => {
  if (axios.isAxiosError(err)) {
    return (
      err.response?.data?.message ||
      err.response?.data?.Message ||
      err.response?.data?.title ||
      defaultMsg
    );
  }
  return defaultMsg;
};

// ============================================================================
// ZUSTAND STORE
// ============================================================================

export const usePeriodStore = create<PeriodState>((set, get) => ({
  periods: [],
  selectedPeriod: null,
  openInfo: null,
  loading: false,
  creating: false,
  error: null,

  clearError: () => set({ error: null }),

  // 1. GET: /api/v1/periods (Fetch List & Active Selection)
  fetchPeriods: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.get("/api/v1/periods");
      if (res.data?.success) {
        const periodsList: PeriodItem[] = res.data.periods || [];

        // Penentuan periode terpilih berdasarkan isSelected atau selectedPeriodId dari backend
        const selected =
          periodsList.find((p) => p.isSelected) ||
          periodsList.find((p) => p.id === res.data.selectedPeriodId) ||
          null;

        set({
          periods: periodsList,
          selectedPeriod: selected,
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        set({ loading: false });
        return;
      }
      const msg = extractErrorMessage(err, "Gagal memuat data periode.");
      console.error("[PERIOD_STORE] fetchPeriods error:", err);
      set({ error: msg, loading: false });
    }
  },

  // 2. GET: /api/v1/periods/open-info (Fetch Form Meta Data untuk Buat Periode Baru)
  fetchOpenInfo: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.get("/api/v1/periods/open-info");
      if (res.data?.success) {
        const info: OpenPeriodInfoResponse = {
          hasExistingPermanentAccounts:
            res.data.hasExistingPermanentAccounts ?? false,
          availableCashAndBankAccounts:
            res.data.availableCashAndBankAccounts || [],
          availableRetainedEarningsAccounts:
            res.data.availableRetainedEarningsAccounts || [],
          permanentAccounts: res.data.permanentAccounts || [],
        };

        set({ openInfo: info, loading: false });
        return info;
      }
      set({ loading: false });
      return null;
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        set({ loading: false });
        return null;
      }
      const msg = extractErrorMessage(
        err,
        "Gagal memuat info pembukaan periode.",
      );
      console.error("[PERIOD_STORE] fetchOpenInfo error:", err);
      set({ error: msg, loading: false });
      return null;
    }
  },

  // 3. POST: /api/v1/periods (Buka / Buat Periode Baru)
  createPeriod: async (payload: CreatePeriodPayload) => {
    set({ creating: true, error: null });
    try {
      const res = await apiClient.post("/api/v1/periods", payload);
      if (res.data?.success) {
        await get().fetchPeriods();
        set({ creating: false });
        return {
          success: true,
          message: res.data.message || "Periode berhasil dibuka.",
        };
      }
      set({ creating: false });
      return { success: false, message: "Gagal membuka periode baru." };
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, "Gagal membuka periode baru.");
      console.error("[PERIOD_STORE] createPeriod error:", err);
      set({ error: msg, creating: false });
      return { success: false, message: msg };
    }
  },

  // 4. POST: /api/v1/periods/select/{id} (Pilih Periode Aktif)
  selectPeriod: async (id: number) => {
    set({ error: null });
    try {
      const res = await apiClient.post(`/api/v1/periods/select/${id}`);
      if (res.data?.success) {
        await get().fetchPeriods();
        return true;
      }
      return false;
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, "Gagal memilih periode.");
      console.error("[PERIOD_STORE] selectPeriod error:", err);
      set({ error: msg });
      return false;
    }
  },

  // 5. POST: /api/v1/periods/clear-selection (Kosongkan Pilihan Periode)
  clearSelection: async () => {
    set({ error: null });
    try {
      const res = await apiClient.post("/api/v1/periods/clear-selection");
      if (res.data?.success) {
        set({ selectedPeriod: null });
        await get().fetchPeriods();
        return true;
      }
      return false;
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, "Gagal mengosongkan periode.");
      console.error("[PERIOD_STORE] clearSelection error:", err);
      set({ error: msg });
      return false;
    }
  },

  // 6. POST: /api/v1/periods/close/{id} (Tutup Periode)
  closePeriod: async (id: number) => {
    set({ error: null });
    try {
      const res = await apiClient.post(`/api/v1/periods/close/${id}`);
      if (res.data?.success) {
        await get().fetchPeriods();
        return {
          success: true,
          message: res.data.message || "Periode berhasil ditutup.",
        };
      }
      return { success: false, message: "Gagal menutup periode." };
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, "Gagal menutup periode.");
      console.error("[PERIOD_STORE] closePeriod error:", err);
      set({ error: msg });
      return { success: false, message: msg };
    }
  },
}));

export default usePeriodStore;
