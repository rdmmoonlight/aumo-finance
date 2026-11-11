<script setup lang="ts">
import { computed, ref } from 'vue'
import OpenNewPeriodForm from './components/OpenNewPeriodForm.vue'
import PeriodsAlerts from './components/PeriodsAlerts.vue'
import PeriodsTable from './components/PeriodsTable.vue'
import { usePeriodsPage } from './hooks/use-periods-page'

// Interface lokal untuk item periode (sesuaikan properti jika ada bidang lain)
export interface PeriodItem {
  id: string | number
  name?: string
  status?: string
  isActive?: boolean
  isOpen?: boolean
  startDate?: string
  endDate?: string
  [key: string]: unknown
}

const {
  periods,
  isLoading,
  isCreating,
  hasActivePeriod,
  activePeriod,
  errorMessage,
  createPeriod,
  closePeriod,
  navigateToDetail,
} = usePeriodsPage()

const isDialogOpen = ref(false)

// Type guard pembantu untuk memeriksa struktur respons secara type-safe tanpa 'any'
function extractPeriodArray(val: unknown): PeriodItem[] | null {
  if (Array.isArray(val)) return val as PeriodItem[]
  if (val && typeof val === 'object') {
    const obj = val as Record<string, unknown>
    if (Array.isArray(obj.data)) return obj.data as PeriodItem[]
    if (Array.isArray(obj.items)) return obj.items as PeriodItem[]
  }
  return null
}

// Defensive Wrapping tanpa @typescript-eslint/no-explicit-any
const safePeriods = computed<PeriodItem[]>(() => {
  return extractPeriodArray(periods.value) ?? []
})

const safeActivePeriod = computed<PeriodItem | null>(() => {
  if (activePeriod?.value) {
    return activePeriod.value as PeriodItem
  }
  // Fallback pencarian manual jika activePeriod di usePeriodsPage belum teresolusi
  return (
    safePeriods.value.find(
      (p) => p.status === 'Open' || p.isActive === true || p.isOpen === true,
    ) ?? null
  )
})

const safeHasActivePeriod = computed<boolean>(() => {
  if (typeof hasActivePeriod?.value === 'boolean') return hasActivePeriod.value
  return !!safeActivePeriod.value
})

const handleCreatePeriod = async (values: { startDate: string; endDate: string }) => {
  await createPeriod(values)
  isDialogOpen.value = false
}

const handleClosePeriod = (id: string) => {
  closePeriod(id)
}

const handleViewDetail = (id: string) => {
  navigateToDetail(id)
}
</script>

<template>
  <div class="flex-1 space-y-6 p-8">
    <!-- Header Halaman -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Periode Buku Kas</h2>
        <p class="text-muted-foreground">Kelola pembukaan dan penutupan periode pembukuan kas.</p>
      </div>
      <div class="flex items-center gap-2">
        <OpenNewPeriodForm v-model:open="isDialogOpen" :is-loading="isCreating" @submit="handleCreatePeriod" />
      </div>
    </div>

    <!-- Alert Ringkasan Status -->
    <PeriodsAlerts :has-active-period="safeHasActivePeriod" :active-period-name="safeActivePeriod?.name"
      :warning-message="errorMessage" />

    <!-- Tabel Data Periode -->
    <PeriodsTable :periods="safePeriods" :is-loading="isLoading" @close-period="handleClosePeriod"
      @view-detail="handleViewDetail" />
  </div>
</template>