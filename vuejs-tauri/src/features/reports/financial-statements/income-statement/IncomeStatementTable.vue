<script setup lang="ts">
import { formatCurrency } from '../formatters';
import type { IncomeStatementData } from '../types';

interface Props {
    data: IncomeStatementData;
}

defineProps<Props>();
</script>

<template>
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
                <!-- 1. PENDAPATAN (REVENUE) -->
                <tr class="bg-gray-50/50 font-semibold text-gray-900">
                    <td colspan="2" class="px-6 py-3 text-xs uppercase tracking-wider text-emerald-800">
                        {{ data.revenue.title }}
                    </td>
                </tr>
                <tr v-for="item in data.revenue.items" :key="item.accountCode"
                    class="hover:bg-gray-50/80 transition-colors">
                    <td class="px-6 py-3 pl-10 font-normal">
                        <span class="font-mono text-xs text-gray-500 mr-2">{{ item.accountCode }}</span>
                        {{ item.accountName }}
                    </td>
                    <td class="px-6 py-3 text-right font-mono text-gray-900">
                        {{ formatCurrency(item.amount) }}
                    </td>
                </tr>
                <tr class="bg-emerald-50/40 font-semibold border-t border-b border-emerald-100">
                    <td class="px-6 py-3 text-emerald-900">Total {{ data.revenue.title }}</td>
                    <td class="px-6 py-3 text-right font-mono text-emerald-900">
                        {{ formatCurrency(data.revenue.subtotal) }}
                    </td>
                </tr>

                <!-- 2. BEBAN POKOK PENJUALAN (COGS) -->
                <tr class="bg-gray-50/50 font-semibold text-gray-900">
                    <td colspan="2" class="px-6 py-3 text-xs uppercase tracking-wider text-emerald-800">
                        {{ data.costOfGoodsSold.title }}
                    </td>
                </tr>
                <tr v-for="item in data.costOfGoodsSold.items" :key="item.accountCode"
                    class="hover:bg-gray-50/80 transition-colors">
                    <td class="px-6 py-3 pl-10 font-normal">
                        <span class="font-mono text-xs text-gray-500 mr-2">{{ item.accountCode }}</span>
                        {{ item.accountName }}
                    </td>
                    <td class="px-6 py-3 text-right font-mono text-gray-900">
                        {{ formatCurrency(item.amount) }}
                    </td>
                </tr>
                <tr class="bg-emerald-50/40 font-semibold border-t border-b border-emerald-100">
                    <td class="px-6 py-3 text-emerald-900">Total {{ data.costOfGoodsSold.title }}</td>
                    <td class="px-6 py-3 text-right font-mono text-emerald-900">
                        {{ formatCurrency(data.costOfGoodsSold.subtotal) }}
                    </td>
                </tr>

                <!-- LABA KOTOR (GROSS PROFIT) -->
                <tr class="bg-emerald-100/60 font-bold border-t-2 border-b-2 border-emerald-200">
                    <td class="px-6 py-3.5 text-emerald-950 uppercase text-xs tracking-wider">Laba Kotor</td>
                    <td class="px-6 py-3.5 text-right font-mono text-emerald-950 text-base">
                        {{ formatCurrency(data.grossProfit) }}
                    </td>
                </tr>

                <!-- 3. BEBAN OPERASIONAL (OPERATING EXPENSES) -->
                <tr class="bg-gray-50/50 font-semibold text-gray-900">
                    <td colspan="2" class="px-6 py-3 text-xs uppercase tracking-wider text-emerald-800">
                        {{ data.operatingExpenses.title }}
                    </td>
                </tr>
                <tr v-for="item in data.operatingExpenses.items" :key="item.accountCode"
                    class="hover:bg-gray-50/80 transition-colors">
                    <td class="px-6 py-3 pl-10 font-normal">
                        <span class="font-mono text-xs text-gray-500 mr-2">{{ item.accountCode }}</span>
                        {{ item.accountName }}
                    </td>
                    <td class="px-6 py-3 text-right font-mono text-gray-900">
                        {{ formatCurrency(item.amount) }}
                    </td>
                </tr>
                <tr class="bg-emerald-50/40 font-semibold border-t border-b border-emerald-100">
                    <td class="px-6 py-3 text-emerald-900">Total {{ data.operatingExpenses.title }}</td>
                    <td class="px-6 py-3 text-right font-mono text-emerald-900">
                        {{ formatCurrency(data.operatingExpenses.subtotal) }}
                    </td>
                </tr>

                <!-- LABA OPERASIONAL -->
                <tr class="bg-gray-100 font-semibold border-t border-b border-gray-200">
                    <td class="px-6 py-3 text-gray-900">Laba Operasional</td>
                    <td class="px-6 py-3 text-right font-mono text-gray-900">
                        {{ formatCurrency(data.operatingIncome) }}
                    </td>
                </tr>

                <!-- 4. PENDAPATAN & BEBAN LAIN-LAIN -->
                <tr v-if="data.otherIncomeExpense && data.otherIncomeExpense.items.length > 0"
                    class="bg-gray-50/50 font-semibold text-gray-900">
                    <td colspan="2" class="px-6 py-3 text-xs uppercase tracking-wider text-emerald-800">
                        {{ data.otherIncomeExpense.title }}
                    </td>
                </tr>
                <tr v-for="item in data.otherIncomeExpense?.items || []" :key="item.accountCode"
                    class="hover:bg-gray-50/80 transition-colors">
                    <td class="px-6 py-3 pl-10 font-normal">
                        <span class="font-mono text-xs text-gray-500 mr-2">{{ item.accountCode }}</span>
                        {{ item.accountName }}
                    </td>
                    <td class="px-6 py-3 text-right font-mono text-gray-900">
                        {{ formatCurrency(item.amount) }}
                    </td>
                </tr>

                <!-- LABA SEBELUM PAJAK -->
                <tr class="bg-gray-100 font-semibold border-t border-b border-gray-200">
                    <td class="px-6 py-3 text-gray-900">Laba Bersih Sebelum Pajak</td>
                    <td class="px-6 py-3 text-right font-mono text-gray-900">
                        {{ formatCurrency(data.netIncomeBeforeTax) }}
                    </td>
                </tr>

                <!-- PAJAK -->
                <tr class="hover:bg-gray-50/80 transition-colors">
                    <td class="px-6 py-3 font-normal">Beban Pajak Penghasilan</td>
                    <td class="px-6 py-3 text-right font-mono text-gray-900">
                        {{ formatCurrency(data.taxExpense) }}
                    </td>
                </tr>

                <!-- LABA BERSIH (NET INCOME) -->
                <tr class="bg-emerald-600 text-white font-bold text-base">
                    <td class="px-6 py-4 rounded-bl-lg">LABA BERSIH TEKUN/PERIODE</td>
                    <td class="px-6 py-4 text-right font-mono rounded-br-lg text-lg">
                        {{ formatCurrency(data.netIncome) }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>