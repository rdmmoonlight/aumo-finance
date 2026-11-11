<script setup lang="ts">
import { computed } from 'vue';
import { useGetDashboardQuery, type GetDashboardResponse } from '../dashboard.api';

defineOptions({ name: 'DashboardTransactionsTable' })

const props = defineProps<{
    period?: string
}>()

// Integrasi langsung dengan TanStack Query composable
const { data: dashboardData, isLoading, isError, error } = useGetDashboardQuery(
    computed(() => ({ period: props.period }))
)

// Mapping data transactions safe-guard jika respons backend tersusun di sub-property
const transactions = computed(() => {
    const res = dashboardData.value as (GetDashboardResponse & {
        recentTransactions?: Array<{
            id: string | number
            title: string
            category: string
            date: string
            type: string
            amount: number
        }>
    }) | undefined
    return res?.recentTransactions ?? []
})

function formatRupiah(val: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(val)
}
</script>

<template>
    <div
        class="p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm space-y-4">
        <div class="flex items-center justify-between">
            <div>
                <h4 class="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Transaksi Terakhir
                </h4>
                <p class="text-xs text-gray-500 dark:text-gray-400">Daftar transaksi arus kas terbaru</p>
            </div>
            <button class="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline">
                Lihat Semua
            </button>
        </div>

        <!-- Table Container -->
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm border-collapse">
                <thead>
                    <tr
                        class="border-b border-gray-200 dark:border-gray-700 font-medium text-xs text-gray-500 uppercase tracking-wider">
                        <th class="py-3 px-4">Deskripsi</th>
                        <th class="py-3 px-4">Kategori</th>
                        <th class="py-3 px-4">Tanggal</th>
                        <th class="py-3 px-4 text-right">Jumlah</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-700/50">
                    <!-- Loading State (Skeleton Row) -->
                    <template v-if="isLoading">
                        <tr v-for="n in 3" :key="n" class="animate-pulse">
                            <td class="py-3 px-4">
                                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                            </td>
                            <td class="py-3 px-4">
                                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                            </td>
                            <td class="py-3 px-4">
                                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                            </td>
                            <td class="py-3 px-4 text-right">
                                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 ml-auto"></div>
                            </td>
                        </tr>
                    </template>

                    <!-- Error State -->
                    <tr v-else-if="isError">
                        <td colspan="4" class="py-6 text-center text-rose-500 text-xs">
                            Gagal memuat data transaksi: {{ error?.message ?? 'Terjadi kesalahan' }}
                        </td>
                    </tr>

                    <!-- Empty State -->
                    <tr v-else-if="transactions.length === 0">
                        <td colspan="4" class="py-6 text-center text-gray-400 text-xs">
                            Belum ada data transaksi.
                        </td>
                    </tr>

                    <!-- Data Rows -->
                    <tr v-else v-for="item in transactions" :key="item.id"
                        class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td class="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                            {{ item.title }}
                        </td>
                        <td class="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">
                            <span class="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 font-normal">
                                {{ item.category }}
                            </span>
                        </td>
                        <td class="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">
                            {{ item.date }}
                        </td>
                        <td :class="[
                            'py-3 px-4 text-right font-mono font-medium text-xs',
                            item.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        ]">
                            {{ item.type === 'income' ? '+' : '-' }} {{ formatRupiah(item.amount) }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>