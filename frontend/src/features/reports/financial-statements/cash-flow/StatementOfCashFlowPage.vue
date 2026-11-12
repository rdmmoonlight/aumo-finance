<script setup lang="ts">
import { useGetStatementOfCashFlowQuery } from '../../reports.api.ts'; // sesuaikan alias path modul laporan Anda
import CashFlowTable from '../cash-flow/CashFlowTable.vue'
import ErrorAlert from '../components/ErrorAlert.vue'
import LoadingState from '../components/LoadingState.vue'
import NoPeriodCard from '../components/NoPeriodCard.vue'
import type { CashFlowData } from '../types'

// TanStack Vue Query Composable
const { data, isLoading, isError, error, refetch } = useGetStatementOfCashFlowQuery()

const handleManagePeriod = () => {
    console.log('Navigasi ke manajemen periode')
}
</script>

<template>
    <div class="space-y-6 p-6">
        <!-- Header Halaman -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
            <div>
                <h1 class="text-2xl font-bold tracking-tight text-gray-900">
                    Laporan Arus Kas
                </h1>
                <p class="mt-1 text-sm text-gray-500" v-if="(data as CashFlowData)?.period">
                    Periode: {{ (data as CashFlowData).period.startDate }} s/d {{ (data as CashFlowData).period.endDate
                    }}
                </p>
            </div>
        </div>

        <!-- State 1: Loading -->
        <LoadingState v-if="isLoading" message="Memuat Laporan Arus Kas..." />

        <!-- State 2: Error -->
        <ErrorAlert v-else-if="isError" title="Gagal Memuat Laporan Arus Kas"
            :message="error?.message || 'Terjadi kesalahan saat mengambil data Laporan Arus Kas.'"
            @retry="() => refetch()" />

        <!-- State 3: Data Kosong / Periode Tidak Ada -->
        <NoPeriodCard v-else-if="!data" title="Belum Ada Periode Aktif"
            message="Silakan buat atau aktifkan periode akuntansi untuk melihat Laporan Arus Kas."
            @action="handleManagePeriod" />

        <!-- State 4: Tampilan Data Utama -->
        <CashFlowTable v-else :data="(data as CashFlowData)" />
    </div>
</template>