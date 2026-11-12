<script setup lang="ts">
import { ref } from 'vue'
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
  selectPeriod,
} = usePeriodsPage()

const isDialogOpen = ref(false)

const handleCreatePeriod = async (values: { startDate: string; endDate: string }) => {
  await createPeriod(values)
  isDialogOpen.value = false
}

const handleClosePeriod = (id: number) => {
  closePeriod(id)
}

const handleSelectPeriod = (id: number) => {
  selectPeriod(id)
}
</script>

<template>
  <div class="flex-1 space-y-6 p-8">
    <!-- Header Halaman -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-1xl font-bold tracking-tight">Periode Buku Kas</h2>
        <p class="text-muted-foreground">Kelola pembukaan dan penutupan periode pembukuan kas.</p>
      </div>
      <div class="flex items-center gap-2">
        <OpenNewPeriodForm v-model:open="isDialogOpen" :is-loading="isCreating" @submit="handleCreatePeriod" />
      </div>
    </div>

    <!-- Alert Ringkasan Status -->
    <PeriodsAlerts :has-active-period="hasActivePeriod" :active-period-name="activePeriod?.periodName"
      :warning-message="errorMessage" />

    <!-- Tabel Data Periode -->
    <PeriodsTable :periods="periods" :is-loading="isLoading" @close-period="handleClosePeriod"
      @select-period="handleSelectPeriod" />
  </div>
</template>
