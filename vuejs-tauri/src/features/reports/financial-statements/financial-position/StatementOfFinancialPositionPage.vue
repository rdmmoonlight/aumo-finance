<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';
import { computed, ref } from 'vue';
import { getStatementOfFinancialPositionApi } from '../../financial-statements/financial-statements.api.ts'; // sesuaikan alias path modul laporan Anda
import ErrorAlert from '../components/ErrorAlert.vue';
import LoadingState from '../components/LoadingState.vue';
import NoPeriodCard from '../components/NoPeriodCard.vue';
import FinancialPositionTable from '../financial-position/FinancialPositionTable.vue';
import type { FinancialPositionData } from '../types.ts';

const isPostClosing = ref<boolean>(false)

const queryParams = computed(() => ({
    isPostClosing: isPostClosing.value,
}))

const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: computed(() => ['statement-of-financial-position', queryParams.value]),
    queryFn: () => getStatementOfFinancialPositionApi(queryParams.value),
})

const handleManagePeriod = () => {
    console.log('Navigasi ke manajemen periode')
}
</script>

<template>
    <div class="space-y-6 p-6">
        <!-- Header Halaman & Filter Post-Closing -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
            <div>
                <h1 class="text-2xl font-bold tracking-tight text-gray-900">
                    Laporan Posisi Keuangan (Neraca)
                </h1>
                <p class="mt-1 text-sm text-gray-500" v-if="(data as FinancialPositionData)?.period">
                    Periode: {{ (data as FinancialPositionData).period.startDate }} s/d {{ (data as
                        FinancialPositionData).period.endDate }}
                </p>
            </div>

            <!-- Toggle Status Post-Closing -->
            <div class="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                <label for="post-closing-toggle" class="text-sm font-medium text-gray-700 cursor-pointer select-none">
                    Tampilkan Setelah Penutupan (Post-Closing)
                </label>
                <input id="post-closing-toggle" type="checkbox" v-model="isPostClosing"
                    class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer" />
            </div>
        </div>

        <!-- State 1: Loading -->
        <LoadingState v-if="isLoading" message="Memuat Laporan Posisi Keuangan..." />

        <!-- State 2: Error -->
        <ErrorAlert v-else-if="isError" title="Gagal Memuat Laporan Posisi Keuangan"
            :message="error?.message || 'Terjadi kesalahan saat mengambil data Laporan Posisi Keuangan.'"
            @retry="() => refetch()" />

        <!-- State 3: Data Kosong / Periode Tidak Ada -->
        <NoPeriodCard v-else-if="!data" title="Belum Ada Periode Aktif"
            message="Silakan buat atau aktifkan periode akuntansi untuk melihat Laporan Posisi Keuangan."
            @action="handleManagePeriod" />

        <!-- State 4: Tampilan Data Utama -->
        <FinancialPositionTable v-else :data="(data as FinancialPositionData)" />
    </div>
</template>