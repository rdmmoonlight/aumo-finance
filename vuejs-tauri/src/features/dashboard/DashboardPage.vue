<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { computed } from 'vue'
import { getDashboardApi } from './dashboard.api'

import AiSummaryCard from './components/AiSummaryCard.vue'
import ExpenseDonut from './components/charts/ExpenseDonut.vue'
import ExpenseRevenueBar from './components/charts/ExpenseRevenueBar.vue'
import RevenueLine from './components/charts/RevenueLine.vue'
import Tables from './components/Tables.vue'

// --- TanStack Vue Query Calls ---
const {
    data: aiSummary,
    isLoading: loadingAi,
    error: errorAi,
    refetch: refetchAi
} = useQuery({
    queryKey: ['dashboard', 'ai-summary'],
    queryFn: () => getDashboardApi(),
})

const {
    data: expenseCategories,
    isLoading: loadingExpense,
    error: errorExpense,
    refetch: refetchExpense
} = useQuery({
    queryKey: ['dashboard', 'expense-categories'],
    queryFn: () => getDashboardApi(),
})

const {
    data: revenueVsExpense,
    isLoading: loadingRevExp,
    error: errorRevExp,
    refetch: refetchRevExp
} = useQuery({
    queryKey: ['dashboard', 'revenue-vs-expense'],
    queryFn: () => getDashboardApi(),
})

const {
    data: revenueTrend,
    isLoading: loadingTrend,
    error: errorTrend,
    refetch: refetchTrend
} = useQuery({
    queryKey: ['dashboard', 'revenue-trend'],
    queryFn: () => getDashboardApi(),
})

const {
    data: recentTransactions,
    isLoading: loadingTx,
    error: errorTx,
    refetch: refetchTx
} = useQuery({
    queryKey: ['dashboard', 'recent-transactions'],
    queryFn: () => getDashboardApi(),
})

// --- Combined States ---
const isLoading = computed(() =>
    loadingAi.value || loadingExpense.value || loadingRevExp.value || loadingTrend.value || loadingTx.value
)

const errorMessage = computed(() => {
    const err = errorAi.value || errorExpense.value || errorRevExp.value || errorTrend.value || errorTx.value
    return err ? (err.message || 'Gagal memuat data dashboard.') : ''
})

function refetchAll() {
    refetchAi()
    refetchExpense()
    refetchRevExp()
    refetchTrend()
    refetchTx()
}
</script>

<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 md:p-8">
        <div class="max-w-7xl mx-auto space-y-6">
            <!-- Header Page -->
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold tracking-tight">Dashboard Ringkasan</h1>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        Pantau arus kas, posisi pengeluaran, dan rekomendasi analitis aplikasi kamu.
                    </p>
                </div>
                <button @click="refetchAll" :disabled="isLoading"
                    class="px-3.5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-50 shadow-sm">
                    {{ isLoading ? 'Memuat...' : 'Segarkan Data' }}
                </button>
            </div>

            <!-- Error Alert -->
            <div v-if="errorMessage"
                class="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50 text-sm">
                {{ errorMessage }}
            </div>

            <!-- Top Section: AI Summary Card -->
            <AiSummaryCard :data="(aiSummary as InstanceType<typeof AiSummaryCard>['$props']['data']) ?? null"
                :loading="loadingAi" />

            <!-- Middle Section: Charts Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ExpenseDonut :data="(expenseCategories as InstanceType<typeof ExpenseDonut>['$props']['data']) ?? []"
                    :loading="loadingExpense" />
                <ExpenseRevenueBar
                    :data="(revenueVsExpense as InstanceType<typeof ExpenseRevenueBar>['$props']['data']) ?? []"
                    :loading="loadingRevExp" />
                <RevenueLine :data="(revenueTrend as InstanceType<typeof RevenueLine>['$props']['data']) ?? []"
                    :loading="loadingTrend" />
            </div>

            <!-- Bottom Section: Transactions Table -->
            <Tables :transactions="recentTransactions ?? []" :loading="loadingTx" />
        </div>
    </div>
</template>