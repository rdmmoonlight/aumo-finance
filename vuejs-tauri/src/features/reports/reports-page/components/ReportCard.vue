<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next';
import type { ReportItem } from '../data';

defineProps<{
    report: ReportItem
}>()
</script>

<template>
    <RouterLink :to="report.href"
        class="group flex items-start gap-3 rounded-xl border border-white/10 bg-black/40 p-4 transition-all hover:border-indigo-500/30 hover:bg-white/[0.06]">
        <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-slate-900/80 text-white/80 group-hover:text-white">
            <component :is="report.icon" class="h-4 w-4" />
        </div>
        <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
                <span class="truncate text-sm font-semibold text-white">
                    {{ report.title }}
                </span>
                <span class="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-white/40">
                    {{ report.step }}
                </span>
            </div>
            <p class="mt-0.5 line-clamp-1 text-xs text-white/50">
                {{ report.desc }}
            </p>
            <div class="mt-2 flex items-center gap-1 text-xs text-white/30 group-hover:text-indigo-300">
                <span class="truncate">{{ report.href }}</span>
                <ArrowRight class="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
        </div>
    </RouterLink>
</template>