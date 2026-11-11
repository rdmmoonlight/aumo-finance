<script setup lang="ts">
import { computed, ref } from 'vue'
import OpenNewPeriodForm from './components/OpenNewPeriodForm.vue'
import PeriodsAlerts from './components/PeriodsAlerts.vue'
import PeriodsTable from './components/PeriodsTable.vue'
import { usePeriodsPage } from './hooks/use-periods-page'

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

// Defensive Wrapping untuk mencegah TypeError .find() jika API me-return null/undefined/object
const safePeriods = computed(() => {
  if (Array.isArray(periods.value)) return periods.value
  if (periods.value && Array.isArray((periods.value as any).data)) return (periods.value as any).data
  if (periods.value && Array.isArray((periods.value as any).items)) return (periods.value as any).items
  return []
})

const safeActivePeriod = computed(() => {
  if (activePeriod?.value) return activePeriod.value
  // Fallback pencarian manual jika activePeriod di usePeriodsPage crash
  return safePeriods.value.find((p: any) => p.status === 'Open' || p.isActive || p.isOpen) || null
})

const safeHasActivePeriod = computed(() => {
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
        <OpenNewPeriodForm
          v-model:open="isDialogOpen"
          :is-loading="isCreating"
          @submit="handleCreatePeriod"
        />
      </div>
    </div>

    <!-- Alert Ringkasan Status -->
    <PeriodsAlerts
      :has-active-period="safeHasActivePeriod"
      :active-period-name="safeActivePeriod?.name"
      :warning-message="errorMessage"
    />

    <!-- Tabel Data Periode -->
    <PeriodsTable
      :periods="safePeriods"
      :is-loading="isLoading"
      @close-period="handleClosePeriod"
      @view-detail="handleViewDetail"
    />
  </div>
</template>
