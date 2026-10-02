<script setup lang="ts">
import type { Period } from '~/types'

definePageMeta({
  layout: 'default'
})

const period = ref<Period>('monthly')

const { data: dashboard, pending } = useDashboardData(period)
</script>

<template>
  <div class="space-y-6">
    <!-- Toolbar Kontrol Halaman Home -->
    <div
      class="flex items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800"
    >
      <div class="flex items-center gap-3">
        <span class="text-sm font-medium text-gray-500 dark:text-gray-400">
          {{ dashboard?.selectedPeriodName ?? "Current Period" }}
        </span>

        <HomePeriodSelect v-model="period" />
      </div>
    </div>

    <!-- Konten Utama Home -->
    <HomeStats :dashboard="dashboard" :pending="pending" />
    <HomeChart :dashboard="dashboard" />
    <HomeSales :dashboard="dashboard" :pending="pending" />
  </div>
</template>
