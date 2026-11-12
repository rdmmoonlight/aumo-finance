<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { getIncomeStatementApi } from '../../financial-statements/financial-statements.api.ts'
import ErrorAlert from '../components/ErrorAlert.vue'
import LoadingState from '../components/LoadingState.vue'
import NoPeriodCard from '../components/NoPeriodCard.vue'
import IncomeStatementTable from '../income-statement/IncomeStatementTable.vue'
import type { IncomeStatementData } from '../types.ts'

const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['income-statement'],
    queryFn: ({ signal }) => getIncomeStatementApi(signal),
})

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
                    Laporan Laba Rugi
                </h1>
                <p class="mt-1 text-sm text-gray-500" v-if="(data as IncomeStatementData)?.period">
                    Periode: {{ (data as IncomeStatementData).period.startDate }} s/d {{ (data as
                        IncomeStatementData).period.endDate }}
                </p>
            </div>
        </div>

        <!-- State 1: Loading -->
        <LoadingState v-if="isLoading" message="Memuat Laporan Laba Rugi..." />

        <!-- State 2: Error -->
        <ErrorAlert v-else-if="isError" title="Gagal Memuat Laporan Laba Rugi"
            :message="error?.message || 'Terjadi kesalahan saat mengambil data Laporan Laba Rugi.'"
            @retry="() => refetch()" />

        <!-- State 3: Data Kosong / Periode Tidak Ada -->
        <NoPeriodCard v-else-if="!data" title="Belum Ada Periode Aktif"
            message="Silakan buat atau aktifkan periode akuntansi untuk melihat Laporan Laba Rugi."
            @action="handleManagePeriod" />

        <!-- State 4: Tampilan Data Utama -->
        <IncomeStatementTable v-else :data="(data as IncomeStatementData)" />
    </div>
</template>