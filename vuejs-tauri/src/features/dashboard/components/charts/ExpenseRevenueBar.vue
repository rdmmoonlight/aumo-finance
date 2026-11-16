<script setup lang="ts">
import { computed } from 'vue';
import type { RevenueVsExpenseData } from '../../api/dashboardApi';

const props = withDefaults(
    defineProps<{
        data?: RevenueVsExpenseData[]
        loading?: boolean
    }>(),
    {
        data: () => [],
        loading: false
    }
)

// Mencari nilai maksimum untuk scaling bar chart secara proporsional
const maxVal = computed(() => {
    if (!props.data.length) return 1
    return Math.max(...props.data.flatMap(d => [d.revenue, d.expense]))
})

function formatRupiah(val: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}
</script>

<template>
    <div
        class="p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm space-y-4">
        <div class="flex items-center justify-between">
            <div>
                <h4 class="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Pendapatan vs Pengeluaran
                </h4>
                <p class="text-xs text-gray-500 dark:text-gray-400">Arus kas beberapa bulan terakhir</p>
            </div>

            <!-- Legend -->
            <div class="flex items-center gap-4 text-xs">
                <div class="flex items-center gap-1.5">
                    <span class="w-3 h-3 rounded bg-emerald-500"></span>
                    <span class="text-gray-600 dark:text-gray-400">Pendapatan</span>
                </div>
                <div class="flex items-center gap-1.5">
                    <span class="w-3 h-3 rounded bg-rose-500"></span>
                    <span class="text-gray-600 dark:text-gray-400">Pengeluaran</span>
                </div>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="h-56 flex items-center justify-center">
            <span class="text-sm text-gray-400 animate-pulse">Memuat grafik arus kas...</span>
        </div>

        <!-- Empty State -->
        <div v-else-if="props.data.length === 0" class="h-56 flex items-center justify-center">
            <span class="text-sm text-gray-400">Tidak ada data arus kas.</span>
        </div>

        <!-- Chart Visual Bars -->
        <div v-else
            class="h-56 flex items-end justify-between gap-2 pt-6 px-2 border-b border-gray-200 dark:border-gray-700">
            <div v-for="item in props.data" :key="item.month"
                class="flex-1 flex flex-col items-center h-full justify-end group relative">
                <!-- Tooltip Hover -->
                <div
                    class="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-gray-900 text-white text-[10px] p-1.5 rounded shadow z-10 whitespace-nowrap pointer-events-none">
                    <div>Masuk: {{ formatRupiah(item.revenue) }}</div>
                    <div>Keluar: {{ formatRupiah(item.expense) }}</div>
                </div>

                <!-- Bars Container -->
                <div class="w-full flex items-end justify-center gap-1 h-full">
                    <!-- Revenue Bar -->
                    <div class="w-1/2 max-w-[20px] bg-emerald-500 rounded-t transition-all duration-300 hover:brightness-110"
                        :style="{ height: `${(item.revenue / maxVal) * 100}%` }"></div>
                    <!-- Expense Bar -->
                    <div class="w-1/2 max-w-[20px] bg-rose-500 rounded-t transition-all duration-300 hover:brightness-110"
                        :style="{ height: `${(item.expense / maxVal) * 100}%` }"></div>
                </div>

                <!-- Month Label -->
                <span class="mt-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {{ item.month }}
                </span>
            </div>
        </div>
    </div>
</template>