<script setup lang="ts">
import { BarChart2 } from 'lucide-vue-next';

defineProps<{
    total: number
}>()
</script>

<template>
    <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div class="flex gap-4">
            <div
                class="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-300/20 bg-gradient-to-br from-indigo-500/80 to-violet-600/80 shadow-lg">
                <BarChart2 class="h-6 w-6" />
            </div>
            <div>
                <h1 class="text-2xl font-bold tracking-tight">Reports Center</h1>
                <p class="mt-1 text-sm text-white/60">
                    Akses {{ total }} laporan siklus akuntansi lengkap.
                </p>
            </div>
        </div>
        <span
            class="inline-flex w-fit items-center rounded-md border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-semibold text-white/60">
            {{ total }} REPORTS
        </span>
    </div>
</template>