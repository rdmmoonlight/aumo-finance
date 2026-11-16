<script setup lang="ts">
import { computed } from 'vue';
import { CATEGORIES, type ReportItem } from '../data';
import ReportCard from './ReportCard.vue';

const props = defineProps<{
    filteredReports: ReportItem[]
}>()

const groupedCategories = computed(() => {
    return CATEGORIES.map((cat) => ({
        ...cat,
        items: props.filteredReports.filter((r) => r.category === cat.id),
    })).filter((cat) => cat.items.length > 0)
})
</script>

<template>
    <div class="space-y-8">
        <div v-for="cat in groupedCategories" :key="cat.id">
            <div class="mb-3 flex items-baseline justify-between">
                <h2 class="text-sm font-semibold text-white/90">
                    {{ cat.label }}
                </h2>
                <span class="text-xs text-white/40">{{ cat.hint }}</span>
            </div>
            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                <ReportCard v-for="report in cat.items" :key="report.href" :report="report" />
            </div>
        </div>
    </div>
</template>