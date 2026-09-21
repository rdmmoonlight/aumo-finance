import { create } from "zustand";
import axios from "axios";
import apiClient from "@/lib/apiClient";

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
  month: number;
  year: number;
  setupMode: "LoadExisting" | "CreateNew" | string;
  cashAccountId?: number | null;
  bankAccountId?: number | null;
  retainedEarningsAccountId?: number | null;
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
  periods: PeriodItem[];
  selectedPeriod: PeriodItem | null;
  openInfo: OpenPeriodInfoResponse | null;
  loading: boolean;
  creating: boolean;
  error: string | null;

  fetchPeriods: () => Promise<void>;
  fetchOpenInfo: () => Promise<OpenPeriodInfoResponse | null>;
  createPeriod: (payload: CreatePeriodPayload) => Promise<{ success: boolean; message?: string }>;
  selectPeriod: (id: number) => Promise<boolean>;
  clearSelection: () => Promise<boolean>;
  closePeriod: (id: number) => Promise<{ success: boolean; message?: string }>;
  clearError: () => void;
}

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

export const usePeriodStore = create<PeriodState>((set, get) => ({
  periods: [],
  selectedPeriod: null,
  openInfo: null,
  loading: false,
  creating: false,
  error: null,

  clearError: () => set({ error: null }),

  // 1. GET: /api/v1/periods
  fetchPeriods: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.get("/api/v1/periods");
      if (res.data?.success) {
        const periodsList: PeriodItem[] = res.data.periods || [];

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

  // 2. GET: /api/v1/periods/open-info
  fetchOpenInfo: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.get("/api/v1/periods/open-info");
      if (res.data?.success) {
        const info: OpenPeriodInfoResponse = {
          hasExistingPermanentAccounts: res.data.hasExistingPermanentAccounts ?? false,
          availableCashAndBankAccounts: res.data.availableCashAndBankAccounts || [],
          availableRetainedEarningsAccounts: res.data.availableRetainedEarningsAccounts || [],
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
      const msg = extractErrorMessage(err, "Gagal memuat info pembukaan periode.");
      console.error("[PERIOD_STORE] fetchOpenInfo error:", err);
      set({ error: msg, loading: false });
      return null;
    }
  },

  // 3. POST: /api/v1/periods
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

  // 4. POST: /api/v1/periods/select/{id} (OPTIMISTIC UPDATE INSTAN)
  selectPeriod: async (id: number) => {
    set({ error: null });

    // Backup state lama jika sewaktu-waktu API gagal
    const previousPeriods = get().periods;
    const previousSelected = get().selectedPeriod;

    // --- OPTIMISTIC UPDATE: Langsung ubah state lokal saat ini juga (0ms delay) ---
    const targetPeriod = previousPeriods.find((p) => p.id === id) || null;
    const updatedPeriods = previousPeriods.map((p) => ({
      ...p,
      isSelected: p.id === id,
    }));

    set({
      selectedPeriod: targetPeriod
        ? { ...targetPeriod, isSelected: true }
        : previousSelected,
      periods: updatedPeriods,
    });

    try {
      const res = await apiClient.post(`/api/v1/periods/select/${id}`);
      if (res.data?.success) {
        return true;
      }
      // Jika backend merespon gagal, kembalikan ke state semula
      set({ periods: previousPeriods, selectedPeriod: previousSelected });
      return false;
    } catch (err: unknown) {
      // Revert state ke semula jika API error
      set({
        periods: previousPeriods,
        selectedPeriod: previousSelected,
        error: extractErrorMessage(err, "Gagal memilih periode."),
      });
      console.error("[PERIOD_STORE] selectPeriod error:", err);
      return false;
    }
  },

  // 5. POST: /api/v1/periods/clear-selection (OPTIMISTIC UPDATE INSTAN)
  clearSelection: async () => {
    set({ error: null });

    const previousPeriods = get().periods;
    const previousSelected = get().selectedPeriod;

    // Langsung hapus seleksi di memori lokal
    const updatedPeriods = previousPeriods.map((p) => ({
      ...p,
      isSelected: false,
    }));

    set({
      selectedPeriod: null,
      periods: updatedPeriods,
    });

    try {
      const res = await apiClient.post("/api/v1/periods/clear-selection");
      if (res.data?.success) {
        return true;
      }
      set({ periods: previousPeriods, selectedPeriod: previousSelected });
      return false;
    } catch (err: unknown) {
      set({
        periods: previousPeriods,
        selectedPeriod: previousSelected,
        error: extractErrorMessage(err, "Gagal mengosongkan periode."),
      });
      console.error("[PERIOD_STORE] clearSelection error:", err);
      return false;
    }
  },

  // 6. POST: /api/v1/periods/close/{id}
  closePeriod: async (id: number) => {
    set({ error: null });
    try {
      const res = await apiClient.post(`/api/v1/periods/close/${id}`);
      if (res.data?.success) {
        // Update status closed lokal secara instan
        set((state) => ({
          periods: state.periods.map((p) =>
            p.id === id ? { ...p, isClosed: true } : p
          ),
          selectedPeriod:
            state.selectedPeriod?.id === id
              ? { ...state.selectedPeriod, isClosed: true }
              : state.selectedPeriod,
        }));
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
