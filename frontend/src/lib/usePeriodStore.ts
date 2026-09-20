import { create } from "zustand";
import axios from "axios";
import apiClient from "@/lib/apiClient";

// Tipe data item periode sesuai response GET /api/v1/periods
export interface PeriodItem {
  id: number;
  periodName: string;
  startDate: string;
  endDate: string;
  isClosed: boolean;
  isSelected: boolean;
}

interface PeriodState {
  // State Utama
  periods: PeriodItem[];
  selectedPeriod: PeriodItem | null;
  loading: boolean;
  error: string | null;

  // Actions / Methods
  fetchPeriods: () => Promise<void>;
  selectPeriod: (id: number) => Promise<boolean>;
  clearSelection: () => Promise<boolean>;
  closePeriod: (id: number) => Promise<boolean>;
}

export const usePeriodStore = create<PeriodState>((set, get) => ({
  periods: [],
  selectedPeriod: null,
  loading: false,
  error: null,

  // 1. Ambil daftar periode & status yang sedang terpilih dari backend
  fetchPeriods: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.get("/api/v1/periods");
      if (res.data?.success) {
        const periodsList: PeriodItem[] = res.data.periods || [];

        // Pencarian periode aktif berdasar flag isSelected atau selectedPeriodId dari controller
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
      if (axios.isAxiosError(err)) {
        if (err.response?.status !== 401) {
          console.error("[PERIOD_STORE] Failed to fetch periods:", err.response?.data || err.message);
        }
        const msg =
          err.response?.data?.message ||
          err.response?.data?.Message ||
          "Gagal memuat data periode.";
        set({ error: msg, loading: false });
      } else {
        console.error("[PERIOD_STORE] Unknown error on fetchPeriods:", err);
        set({ error: "Terjadi kesalahan tidak terduga.", loading: false });
      }
    }
  },

  // 2. Tentukan periode yang sedang dilihat/diaktifkan (POST /api/v1/periods/select/{id})
  selectPeriod: async (id: number) => {
    set({ error: null });
    try {
      const res = await apiClient.post(`/api/v1/periods/select/${id}`);
      if (res.data?.success) {
        // Re-fetch data terbaru (fetchPeriods akan otomatis mengatur state loading)
        await get().fetchPeriods();
        return true;
      }
      return false;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status !== 401) {
          console.error("[PERIOD_STORE] Failed to select period:", err.response?.data || err.message);
        }
        const msg =
          err.response?.data?.message ||
          err.response?.data?.Message ||
          "Gagal memilih periode.";
        set({ error: msg, loading: false });
      } else {
        set({ error: "Gagal memilih periode.", loading: false });
      }
      return false;
    }
  },

  // 3. Batalkan pilihan periode (POST /api/v1/periods/clear-selection)
  clearSelection: async () => {
    set({ error: null });
    try {
      const res = await apiClient.post("/api/v1/periods/clear-selection");
      if (res.data?.success) {
        // Update lokal langsung (optimistic update)
        set({ selectedPeriod: null });
        await get().fetchPeriods();
        return true;
      }
      return false;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status !== 401) {
          console.error("[PERIOD_STORE] Failed to clear selection:", err.response?.data || err.message);
        }
        const msg =
          err.response?.data?.message ||
          err.response?.data?.Message ||
          "Gagal mengosongkan periode.";
        set({ error: msg, loading: false });
      } else {
        set({ error: "Gagal mengosongkan periode.", loading: false });
      }
      return false;
    }
  },

  // 4. Tutup Periode (POST /api/v1/periods/close/{id})
  closePeriod: async (id: number) => {
    set({ error: null });
    try {
      const res = await apiClient.post(`/api/v1/periods/close/${id}`);
      if (res.data?.success) {
        await get().fetchPeriods();
        return true;
      }
      return false;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status !== 401) {
          console.error("[PERIOD_STORE] Failed to close period:", err.response?.data || err.message);
        }
        const msg =
          err.response?.data?.message ||
          err.response?.data?.Message ||
          "Gagal menutup periode.";
        set({ error: msg, loading: false });
      } else {
        set({ error: "Gagal menutup periode.", loading: false });
      }
      return false;
    }
  },
}));

export default usePeriodStore;
  
