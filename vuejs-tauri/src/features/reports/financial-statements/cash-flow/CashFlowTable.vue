<script setup lang="ts">
import { formatCurrency } from '../formatters';
import type { CashFlowData } from '../types';

interface Props {
    data: CashFlowData;
}

defineProps<Props>();
</script>

<template>
    <div class="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table class="w-full text-left text-sm text-gray-700 border-collapse">
            <!-- Header Laporan -->
            <thead class="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                <tr>
                    <th scope="col" class="px-6 py-4">Aktivitas Arus Kas</th>
                    <th scope="col" class="px-6 py-4 text-right">Jumlah (IDR)</th>
                </tr>
            </thead>

            <tbody class="divide-y divide-gray-100">
                <!-- 1. ARUS KAS DARI AKTIVITAS OPERASIONAL -->
                <tr class="bg-gray-50/50 font-semibold text-gray-900">
                    <td colspan="2" class="px-6 py-3 text-xs uppercase tracking-wider text-emerald-800">
                        {{ data.operatingActivities.title }}
                    </td>
                </tr>
                <tr v-for="(item, index) in data.operatingActivities.items" :key="index"
                    class="hover:bg-gray-50/80 transition-colors">
                    <td class="px-6 py-3 pl-10 font-normal text-gray-800">
                        {{ item.description }}
                    </td>
                    <td class="px-6 py-3 text-right font-mono text-gray-900">
                        {{ formatCurrency(item.amount) }}
                    </td>
                </tr>
                <tr class="bg-emerald-50/40 font-semibold border-t border-b border-emerald-100">
                    <td class="px-6 py-3 text-emerald-900">Arus Kas Bersih dari {{ data.operatingActivities.title }}
                    </td>
                    <td class="px-6 py-3 text-right font-mono text-emerald-900">
                        {{ formatCurrency(data.operatingActivities.subtotal) }}
                    </td>
                </tr>

                <!-- 2. ARUS KAS DARI AKTIVITAS INVESTASI -->
                <tr class="bg-gray-50/50 font-semibold text-gray-900">
                    <td colspan="2" class="px-6 py-3 text-xs uppercase tracking-wider text-emerald-800">
                        {{ data.investingActivities.title }}
                    </td>
                </tr>
                <tr v-for="(item, index) in data.investingActivities.items" :key="index"
                    class="hover:bg-gray-50/80 transition-colors">
                    <td class="px-6 py-3 pl-10 font-normal text-gray-800">
                        {{ item.description }}
                    </td>
                    <td class="px-6 py-3 text-right font-mono text-gray-900">
                        {{ formatCurrency(item.amount) }}
                    </td>
                </tr>
                <tr class="bg-emerald-50/40 font-semibold border-t border-b border-emerald-100">
                    <td class="px-6 py-3 text-emerald-900">Arus Kas Bersih dari {{ data.investingActivities.title }}
                    </td>
                    <td class="px-6 py-3 text-right font-mono text-emerald-900">
                        {{ formatCurrency(data.investingActivities.subtotal) }}
                    </td>
                </tr>

                <!-- 3. ARUS KAS DARI AKTIVITAS PENDANAAN -->
                <tr class="bg-gray-50/50 font-semibold text-gray-900">
                    <td colspan="2" class="px-6 py-3 text-xs uppercase tracking-wider text-emerald-800">
                        {{ data.financingActivities.title }}
                    </td>
                </tr>
                <tr v-for="(item, index) in data.financingActivities.items" :key="index"
                    class="hover:bg-gray-50/80 transition-colors">
                    <td class="px-6 py-3 pl-10 font-normal text-gray-800">
                        {{ item.description }}
                    </td>
                    <td class="px-6 py-3 text-right font-mono text-gray-900">
                        {{ formatCurrency(item.amount) }}
                    </td>
                </tr>
                <tr class="bg-emerald-50/40 font-semibold border-t border-b border-emerald-100">
                    <td class="px-6 py-3 text-emerald-900">Arus Kas Bersih dari {{ data.financingActivities.title }}
                    </td>
                    <td class="px-6 py-3 text-right font-mono text-emerald-900">
                        {{ formatCurrency(data.financingActivities.subtotal) }}
                    </td>
                </tr>

                <!-- REKONSILIASI KAS -->
                <tr class="bg-gray-100 font-semibold border-t-2 border-b border-gray-300">
                    <td class="px-6 py-3.5 text-gray-900">Kenaikan / (Penurunan) Bersih Kas</td>
                    <td class="px-6 py-3.5 text-right font-mono text-gray-900 text-base">
                        {{ formatCurrency(data.netChangeInCash) }}
                    </td>
                </tr>
                <tr class="hover:bg-gray-50/80 transition-colors">
                    <td class="px-6 py-3 font-medium text-gray-700">Saldo Kas Awal Periode</td>
                    <td class="px-6 py-3 text-right font-mono text-gray-900">
                        {{ formatCurrency(data.beginningCashBalance) }}
                    </td>
                </tr>

                <!-- SALDO KAS AKHIR -->
                <tr class="bg-emerald-600 text-white font-bold text-base">
                    <td class="px-6 py-4 rounded-bl-lg">SALDO KAS AKHIR PERIODE</td>
                    <td class="px-6 py-4 text-right font-mono rounded-br-lg text-lg">
                        {{ formatCurrency(data.endingCashBalance) }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>