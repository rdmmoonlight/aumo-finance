<script setup lang="ts">
import { computed } from 'vue';
import { formatCurrency } from '../format';

interface Props {
    totalRevenue: number;
    totalExpense: number;
    netIncome: number;
}

const props = defineProps<Props>();

const isProfit = computed(() => props.netIncome >= 0);
</script>

<template>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <!-- Total Pendapatan -->
        <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p class="text-xs font-medium uppercase tracking-wider text-gray-500">
                Total Pendapatan
            </p>
            <p class="mt-2 text-2xl font-bold text-gray-900">
                {{ formatCurrency(totalRevenue) }}
            </p>
        </div>

        <!-- Total Beban -->
        <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p class="text-xs font-medium uppercase tracking-wider text-gray-500">
                Total Beban
            </p>
            <p class="mt-2 text-2xl font-bold text-gray-900">
                {{ formatCurrency(totalExpense) }}
            </p>
        </div>

        <!-- Laba / Rugi Bersih -->
        <div :class="[
            'rounded-lg border p-4 shadow-sm',
            isProfit
                ? 'border-emerald-200 bg-emerald-50/50'
                : 'border-rose-200 bg-rose-50/50'
        ]">
            <p :class="[
                'text-xs font-medium uppercase tracking-wider',
                isProfit ? 'text-emerald-700' : 'text-rose-700'
            ]">
                {{ isProfit ? 'Laba Bersih (Net Income)' : 'Rugi Bersih (Net Loss)' }}
            </p>
            <p :class="[
                'mt-2 text-2xl font-bold',
                isProfit ? 'text-emerald-900' : 'text-rose-900'
            ]">
                {{ formatCurrency(netIncome) }}
            </p>
        </div>
    </div>
</template>