<script setup lang="ts">
import { onMounted, ref } from 'vue';
import ErrorAlert from '../components/ErrorAlert.vue';
import LoadingState from '../components/LoadingState.vue';
import NoPeriodCard from '../components/NoPeriodCard.vue';
import type { RetainedEarningsData } from '../types';
import RetainedEarningsTable from './RetainedEarningsTable.vue';

// State Management
const isLoading = ref<boolean>(true);
const isError = ref<boolean>(false);
const errorMessage = ref<string>('');
const hasPeriod = ref<boolean>(true);
const statementData = ref<RetainedEarningsData | null>(null);

// Fungsi fetching data
const fetchRetainedEarnings = async () => {
    isLoading.value = true;
    isError.value = false;

    try {
        await new Promise((resolve) => setTimeout(resolve, 800));
    } catch (err: unknown) {
        isError.value = true;
        errorMessage.value = err instanceof Error ? err.message : 'Gagal mengambil data Laporan Laba Ditahan.';
    } finally {
        isLoading.value = false;
    }
};

const handleManagePeriod = () => {
    console.log('Navigasi ke manajemen periode');
};

onMounted(() => {
    fetchRetainedEarnings();
});
</script>

<template>
    <div class="space-y-6 p-6">
        <!-- Header Halaman -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
            <div>
                <h1 class="text-2xl font-bold tracking-tight text-gray-900">
                    Laporan Laba Ditahan
                </h1>
                <p class="mt-1 text-sm text-gray-500" v-if="statementData?.period">
                    Periode: {{ statementData.period.startDate }} s/d {{ statementData.period.endDate }}
                </p>
            </div>
        </div>

        <!-- State 1: Loading -->
        <LoadingState v-if="isLoading" message="Memuat Laporan Laba Ditahan..." />

        <!-- State 2: Error -->
        <ErrorAlert v-else-if="isError" title="Gagal Memuat Laporan Laba Ditahan" :message="errorMessage"
            @retry="fetchRetainedEarnings" />

        <!-- State 3: Periode Tidak Aktif / Kosong -->
        <NoPeriodCard v-else-if="!hasPeriod" title="Belum Ada Periode Aktif"
            message="Silakan buat atau aktifkan periode akuntansi untuk melihat Laporan Laba Ditahan."
            @action="handleManagePeriod" />

        <!-- State 4: Tampilan Data Utama -->
        <RetainedEarningsTable v-else-if="statementData" :data="statementData" />
    </div>
</template>