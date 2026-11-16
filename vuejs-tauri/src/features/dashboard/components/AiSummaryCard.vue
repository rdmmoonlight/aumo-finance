<script setup lang="ts">
export interface AiSummary {
    headline: string
    insights: string[]
    recommendation?: string
}

const props = withDefaults(
    defineProps<{
        data?: AiSummary | null
        loading?: boolean
    }>(),
    {
        data: null,
        loading: false,
    }
)
</script>

<template>
    <div
        class="p-5 bg-linear-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-xl shadow-sm">
        <!-- Header Card -->
        <div class="flex items-center gap-2 mb-3">
            <div class="p-1.5 bg-indigo-600 text-white rounded-lg">
                <!-- Icon AI / Sparkles -->
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>
            <h3 class="text-base font-semibold text-indigo-950 dark:text-indigo-200">
                Ringkasan AI
            </h3>
        </div>

        <!-- Loading State -->
        <div v-if="props.loading" class="animate-pulse space-y-3 py-2">
            <div class="h-4 bg-indigo-200/60 dark:bg-indigo-800/40 rounded w-3/4"></div>
            <div class="h-3 bg-indigo-200/40 dark:bg-indigo-800/30 rounded w-5/6"></div>
            <div class="h-3 bg-indigo-200/40 dark:bg-indigo-800/30 rounded w-2/3"></div>
        </div>

        <!-- Data State -->
        <div v-else-if="props.data" class="space-y-3">
            <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                {{ props.data.headline }}
            </p>

            <ul v-if="props.data.insights?.length"
                class="space-y-1 text-xs text-gray-600 dark:text-gray-300 list-disc list-inside">
                <li v-for="(insight, index) in props.data.insights" :key="index">
                    {{ insight }}
                </li>
            </ul>

            <div v-if="props.data.recommendation"
                class="pt-2 mt-2 border-t border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-300">
                <span class="font-semibold">Rekomendasi:</span> {{ props.data.recommendation }}
            </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-xs text-gray-500 py-2 italic">
            Tidak ada ringkasan AI yang tersedia saat ini.
        </div>
    </div>
</template>