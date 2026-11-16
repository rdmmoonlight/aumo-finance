<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';
import { getRetainedEarningsApi } from '../../financial-statements/financial-statements.api.ts';
import ErrorAlert from '../components/ErrorAlert.vue';
import LoadingState from '../components/LoadingState.vue';
import NoPeriodCard from '../components/NoPeriodCard.vue';
import RetainedEarningsTable from '../retained-earnings/RetainedEarningsTable.vue';
import type { RetainedEarningsData } from '../types.ts';

// TanStack Vue Query Composable
const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['retained-earnings'],
    queryFn: ({ signal }) => getRetainedEarningsApi(signal),
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
                    Laporan Laba Ditahan
                </h1>
                <p class="mt-1 text-sm text-gray-500" v-if="(data as RetainedEarningsData)?.period">
                    Periode: {{ (data as RetainedEarningsData).period.startDate }} s/d {{ (data as
                        RetainedEarningsData).period.endDate }}
                </p>
            </div>
        </div>

        <!-- State 1: Loading -->
        <LoadingState v-if="isLoading" message="Memuat Laporan Laba Ditahan..." />

        <!-- State 2: Error -->
        <ErrorAlert v-else-if="isError" title="Gagal Memuat Laporan Laba Ditahan"
            :message="error?.message || 'Terjadi kesalahan saat mengambil data Laporan Laba Ditahan.'"
            @retry="() => refetch()" />

        <!-- State 3: Data Kosong / Periode Tidak Ada -->
        <NoPeriodCard v-else-if="!data" title="Belum Ada Periode Aktif"
            message="Silakan buat atau aktifkan periode akuntansi untuk melihat Laporan Laba Ditahan."
            @action="handleManagePeriod" />

        <!-- State 4: Tampilan Data Utama -->
        <RetainedEarningsTable v-else :data="(data as RetainedEarningsData)" />
    </div>
</template>