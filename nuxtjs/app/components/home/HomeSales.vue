<script setup lang="ts">
import { h } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { DashboardAccountBalance, DashboardData } from '~/composables/useDashboardData'

const props = defineProps<{
  dashboard: DashboardData | null | undefined
  pending: boolean
}>()

// DashboardController's `recentEntries` field is still an empty
// placeholder on the backend (not implemented yet), so this table
// shows the expense breakdown for the selected period instead —
// real data already returned by the same endpoint.
const data = computed(() => props.dashboard?.expenseAccountsList ?? [])

const columns: TableColumn<DashboardAccountBalance>[] = [
  {
    accessorKey: 'referenceNumber',
    header: 'No. Akun',
    cell: ({ row }) => `#${row.getValue('referenceNumber')}`
  },
  {
    accessorKey: 'accountName',
    header: 'Akun'
  },
  {
    accessorKey: 'balance',
    header: () => h('div', { class: 'text-right' }, 'Saldo'),
    cell: ({ row }) => h('div', { class: 'text-right font-medium' }, formatCurrencyIDR(row.getValue('balance')))
  }
]
</script>

<template>
  <UCard v-if="!pending && data.length === 0" class="shrink-0">
    <p class="text-sm text-muted text-center py-6">
      Belum ada beban tercatat untuk periode ini.
    </p>
  </UCard>

  <UTable
    v-else
    :data="data"
    :columns="columns"
    :loading="pending"
    class="shrink-0"
    :ui="{
      base: 'table-fixed border-separate border-spacing-0',
      thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
      tbody: '[&>tr]:last:[&>td]:border-b-0',
      th: 'first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
      td: 'border-b border-default'
    }"
  />
</template>
