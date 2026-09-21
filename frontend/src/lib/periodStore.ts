import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PeriodItem {
  id: number;
  periodName: string;
  startDate: string;
  endDate: string;
  isClosed: boolean;
  isSelected?: boolean;
}

interface PeriodStoreState {
  selectedPeriod: PeriodItem | null;
  setSelectedPeriod: (period: PeriodItem | null) => void;
  clearSelectedPeriod: () => void;
}

export const usePeriodStore = create<PeriodStoreState>()(
  persist(
    (set) => ({
      selectedPeriod: null,
      setSelectedPeriod: (period) => set({ selectedPeriod: period }),
      clearSelectedPeriod: () => set({ selectedPeriod: null }),
    }),
    {
      name: "selected-period-storage",
    },
  ),
);

export default usePeriodStore;
