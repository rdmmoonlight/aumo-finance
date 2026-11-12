<script setup lang="ts">
import { formatCurrency, formatDate, formatMutation } from '../format';
import type { LedgerEntryItem } from '../types';

interface Props {
    entries: LedgerEntryItem[];
    beginningBalance: number;
    endingBalance: number;
    totalDebit: number;
    totalCredit: number;
}

defineProps<Props>();
</script>

<template>
    <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
            <thead class="bg-gray-50">
                <tr>
                    <th scope="col" class="px-4 py-2.5 text-left font-medium text-gray-500">
                        Tanggal
                    </th>
                    <th scope="col" class="px-4 py-2.5 text-left font-medium text-gray-500">
                        No. Referensi
                    </th>
                    <th scope="col" class="px-4 py-2.5 text-left font-medium text-gray-500">
                        Keterangan
                    </th>
                    <th scope="col" class="px-4 py-2.5 text-right font-medium text-gray-500">
                        Debit
                    </th>
                    <th scope="col" class="px-4 py-2.5 text-right font-medium text-gray-500">
                        Kredit
                    </th>
                    <th scope="col" class="px-4 py-2.5 text-right font-medium text-gray-500">
                        Saldo
                    </th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
                <!-- Baris Saldo Awal -->
                <tr class="bg-gray-50/60 font-medium text-gray-700">
                    <td colspan="5" class="px-4 py-2 text-left">
                        Saldo Awal
                    </td>
                    <td class="px-4 py-2 text-right font-mono">
                        {{ formatCurrency(beginningBalance) }}
                    </td>
                </tr>

                <!-- Daftar Mutasi Jurnal -->
                <tr v-for="entry in entries" :key="entry.id" class="hover:bg-gray-50/80 transition-colors">
                    <td class="whitespace-nowrap px-4 py-2.5 text-gray-600">
                        {{ formatDate(entry.date) }}
                    </td>
                    <td class="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-gray-500">
                        {{ entry.referenceNumber || '-' }}
                    </td>
                    <td class="px-4 py-2.5 text-gray-800">
                        {{ entry.description }}
                    </td>
                    <td class="whitespace-nowrap px-4 py-2.5 text-right font-mono text-gray-700">
                        {{ formatMutation(entry.debit) }}
                    </td>
                    <td class="whitespace-nowrap px-4 py-2.5 text-right font-mono text-gray-700">
                        {{ formatMutation(entry.credit) }}
                    </td>
                    <td class="whitespace-nowrap px-4 py-2.5 text-right font-mono font-medium text-gray-900">
                        {{ formatCurrency(entry.balance) }}
                    </td>
                </tr>

                <!-- Empty State Mutasi -->
                <tr v-if="entries.length === 0">
                    <td colspan="6" class="px-4 py-6 text-center text-gray-400 italic">
                        Tidak ada mutasi transaksi pada periode ini.
                    </td>
                </tr>
            </tbody>
            <tfoot class="border-t-2 border-gray-200 bg-gray-50 font-semibold text-gray-900">
                <tr>
                    <td colspan="3" class="px-4 py-2.5 text-right text-xs uppercase tracking-wider text-gray-500">
                        Total Mutasi & Saldo Akhir
                    </td>
                    <td class="whitespace-nowrap px-4 py-2.5 text-right font-mono">
                        {{ formatCurrency(totalDebit) }}
                    </td>
                    <td class="whitespace-nowrap px-4 py-2.5 text-right font-mono">
                        {{ formatCurrency(totalCredit) }}
                    </td>
                    <td class="whitespace-nowrap px-4 py-2.5 text-right font-mono text-gray-950">
                        {{ formatCurrency(endingBalance) }}
                    </td>
                </tr>
            </tfoot>
        </table>
    </div>
</template>