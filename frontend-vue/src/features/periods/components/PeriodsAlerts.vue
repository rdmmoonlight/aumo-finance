<template>
    <div class="space-y-4">
        <!-- Alert Peringatan Jika Ada Pesan Error/Warning -->
        <Alert v-if="props.warningMessage" variant="destructive">
            <AlertCircle class="h-4 w-4" />
            <AlertTitle>Perhatian</AlertTitle>
            <AlertDescription>
                {{ props.warningMessage }}
            </AlertDescription>
        </Alert>

        <!-- Alert Periode Aktif -->
        <Alert v-if="props.hasActivePeriod"
            class="border-green-500/50 bg-green-50/50 text-green-900 dark:bg-green-950/20 dark:text-green-300">
            <CheckCircle2 class="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle>Periode Aktif</AlertTitle>
            <AlertDescription>
                Saat ini periode <strong>{{ props.activePeriodName }}</strong> sedang berjalan. Semua transaksi baru
                akan dicatat ke dalam periode ini.
            </AlertDescription>
        </Alert>

        <!-- Alert Belum Ada Periode -->
        <Alert v-else-if="!props.warningMessage" variant="default">
            <Info class="h-4 w-4" />
            <AlertTitle>Tidak Ada Periode Aktif</AlertTitle>
            <AlertDescription>
                Belum ada periode buku kas yang dibuka. Silakan buka periode baru untuk mulai mencatat transaksi.
            </AlertDescription>
        </Alert>
    </div>
</template>

<script setup lang="ts">
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Info } from 'lucide-vue-next';

interface Props {
    hasActivePeriod?: boolean
    activePeriodName?: string
    warningMessage?: string | null
}

const props = withDefaults(defineProps<Props>(), {
    hasActivePeriod: false,
    activePeriodName: '',
    warningMessage: null,
})
</script>