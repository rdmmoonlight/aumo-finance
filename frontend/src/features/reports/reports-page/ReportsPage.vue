<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { getSummaryApi, type SummaryResponse } from '../reports-page/summary.api.ts'
import ReportsGrid from './components/ReportsGrid.vue'
import ReportsHeader from './components/ReportsHeader.vue'
import ReportsSearch from './components/ReportsSearch.vue'
import ReportsSummary, { type SummaryInfo } from './components/ReportsSummary.vue'
import { REPORTS } from './data'

const globalFilter = ref('')
const summaryData = ref<SummaryResponse | null>(null)
const summaryLoading = ref(true)
const isError = ref(false)

let abortController: AbortController | null = null

async function fetchSummary() {
    abortController = new AbortController()
    try {
        summaryLoading.value = true
        isError.value = false
        const data = await getSummaryApi(abortController.signal)
        summaryData.value = data
    } catch (err: unknown) {
        if (!(err instanceof Error && err.name === 'AbortError')) {
            isError.value = true
        }
    } finally {
        summaryLoading.value = false
    }
}

onMounted(() => {
    fetchSummary()
})

onUnmounted(() => {
    abortController?.abort()
})

const summary = computed<SummaryInfo | null>(() => {
    if (!summaryData.value) return null
    const raw: unknown = summaryData.value
    if (typeof raw !== 'object' || raw === null) return null
    return ('data' in raw ? raw.data : raw) as SummaryInfo
})

const filteredReports = computed(() => {
    if (!globalFilter.value) return REPORTS
    const s = globalFilter.value.toLowerCase()
    return REPORTS.filter(({ title, desc, href }) =>
        `${title} ${desc} ${href}`.toLowerCase().includes(s),
    )
})
</script>

<template>
    <div class="grid w-full place-items-center py-6">
        <div class="w-full max-w-5xl rounded-2xl border border-white/10 bg-[#0F172A] p-6 text-white shadow-2xl">
            <div class="p-6 md:p-8">
                <ReportsHeader :total="REPORTS.length" />
                <ReportsSummary :summary="summary" :is-loading="summaryLoading" :is-error="isError" />
                <ReportsSearch v-model="globalFilter" />
                <hr class="my-6 border-0 border-t border-white/10" />
                <ReportsGrid :filtered-reports="filteredReports" />
            </div>
        </div>
    </div>
</template>