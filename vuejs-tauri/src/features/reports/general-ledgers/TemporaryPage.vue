<script setup lang="ts">
import { computed } from 'vue';
import {
    useGetGeneralLedgerTemporaryQuery,
    useRefreshGeneralLedgerMutation,
} from '../reports.api.ts'; // sesuaikan path import API layer Anda
import LedgerCard from './components/LedgerCard.vue';
import NetIncomeCard from './components/NetIncomeCard.vue';
import NoPeriodState from './components/NoPeriodState.vue';
import PageHeader from './components/PageHeader.vue';

// TanStack Query untuk get data temporary ledger
const { data, isLoading, isError, error, refetch } = useGetGeneralLedgerTemporaryQuery()
const accounts = computed(() =>
    (data.value?.accounts ?? []) as InstanceType<typeof LedgerCard>['$props']['account'][]
)

// Mutation untuk refresh ledger
const refreshMutation = useRefreshGeneralLedgerMutation()

function handleRefresh() {
    refreshMutation.mutate(undefined, {
        onSuccess: () => {
            refetch()
        },
    })
}
</script>

<template>
    <div class="p-6 space-y-6">
        <PageHeader title="Buku Besar - Akun Sementara"
            description="Rincian mutasi dan saldo akhir akun Laba Rugi (Pendapatan dan Beban)"
            :period-name="data?.selectedPeriodName">
            <template #actions>
                <button type="button"
                    class="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                    :disabled="isLoading || refreshMutation.isPending.value" @click="handleRefresh">
                    <svg v-if="refreshMutation.isPending.value" class="h-4 w-4 animate-spin text-gray-600" fill="none"
                        viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    {{ refreshMutation.isPending.value ? 'Refreshing...' : 'Refresh Data' }}
                </button>
            </template>
        </PageHeader>

        <!-- State Loading -->
        <div v-if="isLoading" class="flex items-center justify-center py-12">
            <div class="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>

        <!-- State Error -->
        <div v-else-if="isError" class="rounded-md bg-red-50 p-4 text-sm text-red-700">
            {{ error?.message || 'Gagal memuat data buku besar sementara.' }}
        </div>

        <!-- State Periode Belum Dipilih / Data Kosong -->
        <NoPeriodState v-else-if="!data?.hasPeriodSelected || accounts.length === 0"
            :message="!data?.hasPeriodSelected ? 'Silakan pilih periode terlebih dahulu.' : 'Tidak ada data akun sementara.'" />

        <!-- Main Content -->
        <template v-else>
            <!-- Ringkasan Laba/Rugi -->
            <NetIncomeCard v-if="data.netIncomeBeforeClosing !== undefined" :total-revenue="0" :total-expense="0"
                :net-income="data.netIncomeBeforeClosing" />

            <!-- Daftar Buku Besar per Akun -->
            <div class="space-y-4">
                <LedgerCard v-for="(account, index) in accounts" :key="account.accountId || index" :account="account" />
            </div>
        </template>
    </div>
</template>