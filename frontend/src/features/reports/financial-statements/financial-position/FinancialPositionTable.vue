<script setup lang="ts">
import { formatCurrency } from '../formatters';
import type { FinancialPositionData } from '../types';

interface Props {
    data: FinancialPositionData;
}

defineProps<Props>();
</script>

<template>
    <div class="space-y-6">
        <div class="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table class="w-full text-left text-sm text-gray-700 border-collapse">
                <!-- Header Laporan -->
                <thead class="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                    <tr>
                        <th scope="col" class="px-6 py-4">Kode / Akun</th>
                        <th scope="col" class="px-6 py-4 text-right">Jumlah (IDR)</th>
                    </tr>
                </thead>

                <tbody class="divide-y divide-gray-100">
                    <!-- ==================== 1. ASET ==================== -->
                    <tr class="bg-emerald-900 text-white font-bold uppercase tracking-wider text-xs">
                        <td colspan="2" class="px-6 py-3">1. ASET</td>
                    </tr>

                    <!-- ASET LANCAR -->
                    <tr class="bg-gray-50/50 font-semibold text-gray-900">
                        <td colspan="2" class="px-6 py-2.5 text-xs uppercase tracking-wider text-emerald-800 pl-8">
                            {{ data.assets.currentAssets.title }}
                        </td>
                    </tr>
                    <tr v-for="item in data.assets.currentAssets.items" :key="item.accountCode"
                        class="hover:bg-gray-50/80 transition-colors">
                        <td class="px-6 py-2.5 pl-12 font-normal">
                            <span class="font-mono text-xs text-gray-500 mr-2">{{ item.accountCode }}</span>
                            {{ item.accountName }}
                        </td>
                        <td class="px-6 py-2.5 text-right font-mono text-gray-900">
                            {{ formatCurrency(item.amount) }}
                        </td>
                    </tr>
                    <tr class="bg-emerald-50/40 font-semibold border-t border-b border-emerald-100">
                        <td class="px-6 py-2.5 pl-8 text-emerald-900">Total {{ data.assets.currentAssets.title }}</td>
                        <td class="px-6 py-2.5 text-right font-mono text-emerald-900">
                            {{ formatCurrency(data.assets.currentAssets.subtotal) }}
                        </td>
                    </tr>

                    <!-- ASET TIDAK LANCAR -->
                    <tr class="bg-gray-50/50 font-semibold text-gray-900">
                        <td colspan="2" class="px-6 py-2.5 text-xs uppercase tracking-wider text-emerald-800 pl-8">
                            {{ data.assets.nonCurrentAssets.title }}
                        </td>
                    </tr>
                    <tr v-for="item in data.assets.nonCurrentAssets.items" :key="item.accountCode"
                        class="hover:bg-gray-50/80 transition-colors">
                        <td class="px-6 py-2.5 pl-12 font-normal">
                            <span class="font-mono text-xs text-gray-500 mr-2">{{ item.accountCode }}</span>
                            {{ item.accountName }}
                        </td>
                        <td class="px-6 py-2.5 text-right font-mono text-gray-900">
                            {{ formatCurrency(item.amount) }}
                        </td>
                    </tr>
                    <tr class="bg-emerald-50/40 font-semibold border-t border-b border-emerald-100">
                        <td class="px-6 py-2.5 pl-8 text-emerald-900">Total {{ data.assets.nonCurrentAssets.title }}
                        </td>
                        <td class="px-6 py-2.5 text-right font-mono text-emerald-900">
                            {{ formatCurrency(data.assets.nonCurrentAssets.subtotal) }}
                        </td>
                    </tr>

                    <!-- TOTAL ASET -->
                    <tr class="bg-emerald-100/70 font-bold border-t-2 border-b-2 border-emerald-300 text-emerald-950">
                        <td class="px-6 py-3.5 uppercase text-xs tracking-wider">TOTAL ASET</td>
                        <td class="px-6 py-3.5 text-right font-mono text-base">
                            {{ formatCurrency(data.assets.totalAssets) }}
                        </td>
                    </tr>

                    <!-- ==================== 2. LIABILITAS ==================== -->
                    <tr class="bg-emerald-900 text-white font-bold uppercase tracking-wider text-xs">
                        <td colspan="2" class="px-6 py-3">2. LIABILITAS</td>
                    </tr>

                    <!-- LIABILITAS JANGKA PENDEK -->
                    <tr class="bg-gray-50/50 font-semibold text-gray-900">
                        <td colspan="2" class="px-6 py-2.5 text-xs uppercase tracking-wider text-emerald-800 pl-8">
                            {{ data.liabilities.currentLiabilities.title }}
                        </td>
                    </tr>
                    <tr v-for="item in data.liabilities.currentLiabilities.items" :key="item.accountCode"
                        class="hover:bg-gray-50/80 transition-colors">
                        <td class="px-6 py-2.5 pl-12 font-normal">
                            <span class="font-mono text-xs text-gray-500 mr-2">{{ item.accountCode }}</span>
                            {{ item.accountName }}
                        </td>
                        <td class="px-6 py-2.5 text-right font-mono text-gray-900">
                            {{ formatCurrency(item.amount) }}
                        </td>
                    </tr>
                    <tr class="bg-emerald-50/40 font-semibold border-t border-b border-emerald-100">
                        <td class="px-6 py-2.5 pl-8 text-emerald-900">Total {{ data.liabilities.currentLiabilities.title
                        }}</td>
                        <td class="px-6 py-2.5 text-right font-mono text-emerald-900">
                            {{ formatCurrency(data.liabilities.currentLiabilities.subtotal) }}
                        </td>
                    </tr>

                    <!-- LIABILITAS JANGKA PANJANG -->
                    <tr class="bg-gray-50/50 font-semibold text-gray-900">
                        <td colspan="2" class="px-6 py-2.5 text-xs uppercase tracking-wider text-emerald-800 pl-8">
                            {{ data.liabilities.nonCurrentLiabilities.title }}
                        </td>
                    </tr>
                    <tr v-for="item in data.liabilities.nonCurrentLiabilities.items" :key="item.accountCode"
                        class="hover:bg-gray-50/80 transition-colors">
                        <td class="px-6 py-2.5 pl-12 font-normal">
                            <span class="font-mono text-xs text-gray-500 mr-2">{{ item.accountCode }}</span>
                            {{ item.accountName }}
                        </td>
                        <td class="px-6 py-2.5 text-right font-mono text-gray-900">
                            {{ formatCurrency(item.amount) }}
                        </td>
                    </tr>
                    <tr class="bg-emerald-50/40 font-semibold border-t border-b border-emerald-100">
                        <td class="px-6 py-2.5 pl-8 text-emerald-900">Total {{
                            data.liabilities.nonCurrentLiabilities.title }}</td>
                        <td class="px-6 py-2.5 text-right font-mono text-emerald-900">
                            {{ formatCurrency(data.liabilities.nonCurrentLiabilities.subtotal) }}
                        </td>
                    </tr>

                    <!-- TOTAL LIABILITAS -->
                    <tr class="bg-gray-200/80 font-bold border-t border-b border-gray-300 text-gray-900">
                        <td class="px-6 py-3 uppercase text-xs tracking-wider">TOTAL LIABILITAS</td>
                        <td class="px-6 py-3 text-right font-mono">
                            {{ formatCurrency(data.liabilities.totalLiabilities) }}
                        </td>
                    </tr>

                    <!-- ==================== 3. EKUITAS ==================== -->
                    <tr class="bg-emerald-900 text-white font-bold uppercase tracking-wider text-xs">
                        <td colspan="2" class="px-6 py-3">3. EKUITAS</td>
                    </tr>
                    <tr v-for="item in data.equity.section.items" :key="item.accountCode"
                        class="hover:bg-gray-50/80 transition-colors">
                        <td class="px-6 py-2.5 pl-12 font-normal">
                            <span class="font-mono text-xs text-gray-500 mr-2">{{ item.accountCode }}</span>
                            {{ item.accountName }}
                        </td>
                        <td class="px-6 py-2.5 text-right font-mono text-gray-900">
                            {{ formatCurrency(item.amount) }}
                        </td>
                    </tr>
                    <tr class="bg-gray-200/80 font-bold border-t border-b border-gray-300 text-gray-900">
                        <td class="px-6 py-3 uppercase text-xs tracking-wider">TOTAL EKUITAS</td>
                        <td class="px-6 py-3 text-right font-mono">
                            {{ formatCurrency(data.equity.totalEquity) }}
                        </td>
                    </tr>

                    <!-- TOTAL LIABILITAS DAN EKUITAS -->
                    <tr class="bg-emerald-600 text-white font-bold text-base">
                        <td class="px-6 py-4 rounded-bl-lg uppercase tracking-wider">TOTAL LIABILITAS & EKUITAS</td>
                        <td class="px-6 py-4 text-right font-mono rounded-br-lg text-lg">
                            {{ formatCurrency(data.totalLiabilitiesAndEquity) }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>