<script setup lang="ts">
import { computed } from 'vue';
import type { RevenueTrendData } from '../../api/dashboardApi';

const props = withDefaults(
    defineProps<{
        data?: RevenueTrendData[]
        loading?: boolean
    }>(),
    {
        data: () => [],
        loading: false
    }
)

const maxVal = computed(() => {
    if (!props.data.length) return 1
    return Math.max(...props.data.map(d => d.amount))
})

const minVal = computed(() => {
    if (!props.data.length) return 0
    return Math.min(...props.data.map(d => d.amount))
})

// Membuat jalur SVG Path secara dinamis berdasarkan data tren
const svgPoints = computed(() => {
    if (props.data.length < 2) return ''
    const width = 300
    const height = 120
    const range = maxVal.value - minVal.value || 1

    return props.data
        .map((item, index) => {
            const x = (index / (props.data.length - 1)) * width
            const y = height - ((item.amount - minVal.value) / range) * (height - 20) - 10
            return `${x},${y}`
        })
        .join(' L ')
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
                    Tren Pendapatan
                </h4>
                <p class="text-xs text-gray-500 dark:text-gray-400">Pertumbuhan pendapatan berkala</p>
            </div>
            <span class="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded">
                +12.5% vs bulan lalu
            </span>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="h-44 flex items-center justify-center">
            <span class="text-sm text-gray-400 animate-pulse">Memuat grafik tren...</span>
        </div>

        <!-- Empty State -->
        <div v-else-if="props.data.length === 0" class="h-44 flex items-center justify-center">
            <span class="text-sm text-gray-400">Tidak ada data tren pendapatan.</span>
        </div>

        <!-- Line Chart SVG Visual -->
        <div v-else class="space-y-2">
            <div class="h-36 w-full relative">
                <svg class="w-full h-full overflow-visible" viewBox="0 0 300 120" preserveAspectRatio="none">
                    <!-- Horizontal Grid Lines -->
                    <line x1="0" y1="20" x2="300" y2="20" stroke="currentColor"
                        class="text-gray-100 dark:text-gray-700/50" stroke-width="1" />
                    <line x1="0" y1="60" x2="300" y2="60" stroke="currentColor"
                        class="text-gray-100 dark:text-gray-700/50" stroke-width="1" />
                    <line x1="0" y1="100" x2="300" y2="100" stroke="currentColor"
                        class="text-gray-100 dark:text-gray-700/50" stroke-width="1" />

                    <!-- Trend Line -->
                    <path v-if="svgPoints" :d="`M ${svgPoints}`" fill="none" stroke="#3b82f6" stroke-width="3"
                        stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </div>

            <!-- X-Axis Labels -->
            <div class="flex justify-between text-[11px] text-gray-400 font-medium">
                <span v-for="item in props.data" :key="item.date">
                    {{ item.date }}
                </span>
            </div>
        </div>
    </div>
</template>