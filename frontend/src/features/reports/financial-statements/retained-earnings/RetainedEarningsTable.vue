<script setup lang="ts">
import { formatCurrency } from '../formatters';
import type { RetainedEarningsData } from '../types';

interface Props {
    data: RetainedEarningsData;
}

defineProps<Props>();
</script>

<template>
    <div class="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table class="w-full text-left text-sm text-gray-700 border-collapse">
            <!-- Header Laporan -->
            <thead class="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                <tr>
                    <th scope="col" class="px-6 py-4">Keterangan</th>
                    <th scope="col" class="px-6 py-4 text-right">Jumlah (IDR)</th>
                </tr>
            </thead>

            <tbody class="divide-y divide-gray-100">
                <!-- Saldo Awal -->
                <tr class="hover:bg-gray-50/80 transition-colors">
                    <td class="px-6 py-3.5 font-medium text-gray-900">
                        Saldo Laba Ditahan (Awal Periode)
                    </td>
                    <td class="px-6 py-3.5 text-right font-mono text-gray-900">
                        {{ formatCurrency(data.beginningBalance) }}
                    </td>
                </tr>

                <!-- Laba Bersih Periode Berjalan -->
                <tr class="hover:bg-gray-50/80 transition-colors">
                    <td class="px-6 py-3.5 font-medium text-gray-900 pl-8">
                        (+) Laba Bersih Periode Berjalan
                    </td>
                    <td class="px-6 py-3.5 text-right font-mono text-emerald-700">
                        {{ formatCurrency(data.netIncome) }}
                    </td>
                </tr>

                <!-- Dividen -->
                <tr class="hover:bg-gray-50/80 transition-colors">
                    <td class="px-6 py-3.5 font-medium text-gray-900 pl-8">
                        (-) Pembagian Dividen
                    </td>
                    <td class="px-6 py-3.5 text-right font-mono text-red-600">
                        ({{ formatCurrency(Math.abs(data.dividendsPaid)) }})
                    </td>
                </tr>

                <!-- Penyesuaian Lain-lain (jika ada) -->
                <tr v-if="data.otherAdjustments !== 0" class="hover:bg-gray-50/80 transition-colors">
                    <td class="px-6 py-3.5 font-medium text-gray-900 pl-8">
                        (+/-) Penyesuaian Lain-lain
                    </td>
                    <td class="px-6 py-3.5 text-right font-mono text-gray-900">
                        {{ formatCurrency(data.otherAdjustments) }}
                    </td>
                </tr>

                <!-- Saldo Akhir -->
                <tr class="bg-emerald-600 text-white font-bold text-base">
                    <td class="px-6 py-4 rounded-bl-lg">
                        Saldo Laba Ditahan (Akhir Periode)
                    </td>
                    <td class="px-6 py-4 text-right font-mono rounded-br-lg text-lg">
                        {{ formatCurrency(data.endingBalance) }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>