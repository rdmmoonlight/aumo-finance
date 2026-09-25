<script setup lang="ts">
import type { DashboardData } from '~/composables/useDashboardData'
import type { Stat } from '~/types'

const props = defineProps<{
  dashboard: DashboardData | null | undefined
  pending: boolean
}>()

const stats = computed<Stat[]>(() => {
  const d = props.dashboard

  return [
    {
      title: 'Total Assets',
      icon: 'i-lucide-wallet',
      value: formatCurrencyIDR(d?.totalAssets ?? 0)
    },
    {
      title: 'Cash & Bank',
      icon: 'i-lucide-banknote',
      value: formatCurrencyIDR((d?.totalCashOnHand ?? 0) + (d?.totalBankBalance ?? 0))
    },
    {
      title: 'Liabilities',
      icon: 'i-lucide-scale',
      value: formatCurrencyIDR(d?.totalLiabilities ?? 0)
    },
    {
      title: 'Net Income',
      icon: 'i-lucide-trending-up',
      value: formatCurrencyIDR(d?.netIncome ?? 0)
    }
  ]
})
</script>

<template>
  <UPageGrid class="lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-px">
    <UPageCard
      v-for="(stat, index) in stats"
      :key="index"
      :icon="stat.icon"
      :title="stat.title"
      variant="subtle"
      :ui="{
        container: 'gap-y-1.5',
        wrapper: 'items-start',
        leading: 'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25 flex-col',
        title: 'font-normal text-muted text-xs uppercase'
      }"
      class="lg:rounded-none first:rounded-l-lg last:rounded-r-lg hover:z-1"
    >
      <div class="flex items-center gap-2">
        <span v-if="pending" class="text-2xl font-semibold text-dimmed">···</span>
        <span v-else class="text-2xl font-semibold text-highlighted">
          {{ stat.value }}
        </span>
      </div>
    </UPageCard>
  </UPageGrid>
</template>
