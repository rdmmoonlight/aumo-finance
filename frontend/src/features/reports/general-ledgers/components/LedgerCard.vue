<script setup lang="ts">
import { ref } from 'vue';
import { formatCurrency } from '../format';
import type { LedgerAccountGroup } from '../types';
import LedgerTable from './LedgerTable.vue';

interface Props {
    account: LedgerAccountGroup;
    defaultExpanded?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    defaultExpanded: true,
});

const isExpanded = ref(props.defaultExpanded);

function toggleExpand() {
    isExpanded.value = !isExpanded.value;
}
</script>

<template>
    <div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <!-- Header Akun / Collapsible Bar -->
        <div class="flex cursor-pointer items-center justify-between bg-gray-50/80 px-4 py-3 transition-colors hover:bg-gray-100/70"
            @click="toggleExpand">
            <div class="flex items-center gap-3">
                <button type="button" class="text-gray-400 transition-transform duration-200 focus:outline-none"
                    :class="{ 'rotate-90': isExpanded }" aria-label="Toggle section">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                <div>
                    <h3 class="text-sm font-bold text-gray-900">
                        <span class="font-mono text-gray-500 mr-1.5">{{ account.accountCode }}</span>
                        {{ account.accountName }}
                    </h3>
                    <p class="text-xs text-gray-400">
                        {{ account.entries.length }} Transaksi
                    </p>
                </div>
            </div>

            <div class="flex items-center gap-4 text-right">
                <div>
                    <p class="text-xs text-gray-400">Saldo Akhir</p>
                    <p class="font-mono text-sm font-bold text-gray-900">
                        {{ formatCurrency(account.endingBalance) }}
                    </p>
                </div>
            </div>
        </div>

        <!-- Body: Tabel Detail Jurnal -->
        <div v-show="isExpanded" class="border-t border-gray-200">
            <LedgerTable :entries="account.entries" :beginning-balance="account.beginningBalance"
                :ending-balance="account.endingBalance" :total-debit="account.totalDebit"
                :total-credit="account.totalCredit" />
        </div>
    </div>
</template>