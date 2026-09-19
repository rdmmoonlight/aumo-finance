import { create } from "zustand";
import { persist } from "zustand/middleware";
import apiClient from "@/lib/apiClient";

// Tipe data item periode sesuai response GET /api/v1/periods
export interface PeriodItem {
  id: number;
  periodName: string; // Contoh: "September 2026"
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

export const usePeriodStore = create<PeriodState>()(
  persist(
    (set, get) => ({
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
            const selected =
              periodsList.find((p) => p.isSelected) ||
              periodsList.find((p) => p.id === res.data.selectedPeriodId) ||
              null;

            set({
              periods: periodsList,
              selectedPeriod: selected,
              loading: false,
            });
          }
        } catch (err: any) {
          console.error("[PERIOD_STORE] Failed to fetch periods:", err);
          set({
            error: err.response?.data?.message || "Gagal memuat data periode.",
            loading: false,
          });
        }
      },

      // 2. Tentukan periode yang sedang dilihat/diaktifkan (POST /api/v1/periods/select/{id})
      selectPeriod: async (id: number) => {
        set({ loading: true, error: null });
        try {
          const res = await apiClient.post(`/api/v1/periods/select/${id}`);
          if (res.data?.success) {
            // Re-fetch data terbaru dari server agar state lokal selalu valid
            await get().fetchPeriods();
            return true;
          }
          return false;
        } catch (err: any) {
          console.error("[PERIOD_STORE] Failed to select period:", err);
          set({
            error: err.response?.data?.message || "Gagal memilih periode.",
            loading: false,
          });
          return false;
        }
      },

      // 3. Batalkan pilihan periode (POST /api/v1/periods/clear-selection)
      clearSelection: async () => {
        set({ loading: true, error: null });
        try {
          const res = await apiClient.post("/api/v1/periods/clear-selection");
          if (res.data?.success) {
            await get().fetchPeriods();
            return true;
          }
          return false;
        } catch (err: any) {
          console.error("[PERIOD_STORE] Failed to clear selection:", err);
          set({
            error: err.response?.data?.message || "Gagal mengosongkan periode.",
            loading: false,
          });
          return false;
        }
      },

      // 4. Tutup Periode (POST /api/v1/periods/close/{id})
      closePeriod: async (id: number) => {
        set({ loading: true, error: null });
        try {
          const res = await apiClient.post(`/api/v1/periods/close/${id}`);
          if (res.data?.success) {
            await get().fetchPeriods();
            return true;
          }
          return false;
        } catch (err: any) {
          console.error("[PERIOD_STORE] Failed to close period:", err);
          set({
            error: err.response?.data?.message || "Gagal menutup periode.",
            loading: false,
          });
          return false;
        }
      },
    }),
    {
      name: "active-period-storage",
      // Hanya simpan id/data terpenting ke LocalStorage agar terhindar dari stale state
      partialize: (state) => ({ selectedPeriod: state.selectedPeriod }),
    },
  ),
);
