<script setup lang="ts">
import { computed } from 'vue';
import type { ExpenseCategoryData } from '../../api/dashboardApi';

const props = withDefaults(
    defineProps<{
        data?: ExpenseCategoryData[]
        loading?: boolean
    }>(),
    {
        data: () => [],
        loading: false
    }
)

// Hitung total pengeluaran untuk persentase
const totalExpense = computed(() => {
    return props.data.reduce((acc, item) => acc + item.amount, 0)
})

// Palette warna default jika data tidak menyertakan warna
const defaultColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b']

function getColor(item: ExpenseCategoryData, index: number): string {
    return item.color || defaultColors[index % defaultColors.length]
}

function formatRupiah(val: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}
</script>

<template>
    <div
        class="p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm space-y-4">
        <div class="flex items-center justify-between">
            <h4 class="text-base font-semibold text-gray-900 dark:text-gray-100">
                Kategori Pengeluaran
            </h4>
            <span class="text-xs text-gray-500 dark:text-gray-400">Bulan Ini</span>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="h-48 flex items-center justify-center">
            <span class="text-sm text-gray-400 animate-pulse">Memuat grafik pengeluaran...</span>
        </div>

        <!-- Empty State -->
        <div v-else-if="props.data.length === 0" class="h-48 flex items-center justify-center">
            <span class="text-sm text-gray-400">Tidak ada data pengeluaran.</span>
        </div>

        <!-- Content State -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <!-- Visual Donut (SVG) -->
            <div class="relative flex items-center justify-center h-44">
                <svg class="w-36 h-36 transform -rotate-90" viewBox="0 0 36 36">
                    <path class="text-gray-100 dark:text-gray-700 stroke-current" stroke-width="3.8" fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <!-- Ring Segments Dummy / Visual Representation -->
                    <circle v-for="(item, index) in props.data" :key="item.category" cx="18" cy="18" r="15.9155"
                        fill="none" :stroke="getColor(item, index)" stroke-width="3.8"
                        :stroke-dasharray="`${(item.amount / (totalExpense || 1)) * 100}, 100`"
                        :stroke-dashoffset="0" />
                </svg>
                <div class="absolute text-center">
                    <span class="text-xs text-gray-400 block">Total</span>
                    <span class="text-sm font-bold text-gray-800 dark:text-gray-200">
                        {{ formatRupiah(totalExpense) }}
                    </span>
                </div>
            </div>

            <!-- Legend -->
            <div class="space-y-2">
                <div v-for="(item, index) in props.data" :key="item.category"
                    class="flex items-center justify-between text-xs">
                    <div class="flex items-center gap-2">
                        <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: getColor(item, index) }"></span>
                        <span class="text-gray-700 dark:text-gray-300 font-medium">{{ item.category }}</span>
                    </div>
                    <span class="text-gray-500 dark:text-gray-400 font-mono">
                        {{ formatRupiah(item.amount) }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>