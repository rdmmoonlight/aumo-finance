<script setup lang="ts">
import { Activity, CalendarCheck2, Layers, Receipt } from 'lucide-vue-next'

export interface SummaryInfo {
    totalJournal?: number
    activeCoa?: number
    activePeriodName?: string
    isPeriodOpen?: boolean
}

defineProps<{
    summary: SummaryInfo | null
    isLoading: boolean
    isError: boolean
}>()
</script>

<template>
    <div class="relative mt-6 overflow-hidden rounded-2xl border border-white/10">
        <div
            class="absolute inset-0 bg-gradient-to-br from-indigo-500/30 via-transparent to-violet-500/20 opacity-60" />
        <div
            class="relative grid grid-cols-1 divide-y divide-white/10 bg-[#0B1226]/90 backdrop-blur md:grid-cols-3 md:divide-x md:divide-y-0">
            <!-- Total Journal -->
            <div class="flex items-center gap-4 p-5">
                <div
                    class="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/15 text-indigo-300">
                    <Receipt class="h-5 w-5" />
                </div>
                <div>
                    <p class="text-xs uppercase tracking-widest text-white/40">
                        Total Journal
                    </p>
                    <div v-if="isLoading" class="mt-1 h-6 w-16 animate-pulse rounded bg-white/10" />
                    <p v-else class="text-2xl font-bold tabular-nums text-white">
                        {{ isError ? '-' : (summary?.totalJournal ?? 0) }}
                    </p>
                    <p class="mt-0.5 flex items-center gap-1 text-xs text-white/40">
                        <Activity class="h-3 w-3" /> entri tercatat
                    </p>
                </div>
            </div>

            <!-- Active COA -->
            <div class="flex items-center gap-4 p-5">
                <div
                    class="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/15 text-violet-300">
                    <Layers class="h-5 w-5" />
                </div>
                <div>
                    <p class="text-xs uppercase tracking-widest text-white/40">
                        Active COA
                    </p>
                    <div v-if="isLoading" class="mt-1 h-6 w-16 animate-pulse rounded bg-white/10" />
                    <p v-else class="text-2xl font-bold tabular-nums text-white">
                        {{ isError ? '-' : (summary?.activeCoa ?? 0) }}
                    </p>
                    <p class="text-xs text-white/40">akun aktif</p>
                </div>
            </div>

            <!-- Selected Period -->
            <div class="flex items-center gap-4 p-5">
                <div
                    class="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70">
                    <CalendarCheck2 class="h-5 w-5" />
                </div>
                <div class="min-w-0 flex-1">
                    <p class="text-xs uppercase tracking-widest text-white/40">
                        Selected Period
                    </p>
                    <div v-if="isLoading" class="mt-1 h-6 w-32 animate-pulse rounded bg-white/10" />
                    <p v-else class="truncate text-sm font-semibold text-white">
                        {{ isError ? 'Gagal load' : summary?.activePeriodName }}
                    </p>
                    <div v-if="!isLoading" class="mt-1.5 flex items-center gap-2">
                        <span class="h-2 w-2 rounded-full" :class="summary?.isPeriodOpen
                                ? 'animate-pulse bg-emerald-400'
                                : 'bg-amber-400'
                            " />
                        <span class="text-xs" :class="summary?.isPeriodOpen ? 'text-emerald-300' : 'text-amber-300/80'
                            ">
                            {{ summary?.isPeriodOpen ? 'Open' : 'Closed' }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>