<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FilePen, Loader2, Pencil, Plus } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import DeleteEntryDialog from './components/DeleteEntryDialog.vue'
import GeneralJournalTable from './components/GeneralJournalTable.vue'
import JournalEmptyState from './components/JournalEmptyState.vue'
import { getJournalsGeneralApi } from './journals.api'
import { formatDateDisplay } from './lib/format'
import type { FlatJournalRow, JournalEntry } from './lib/types'

interface GeneralJournalResponse {
    entries: JournalEntry[]
    selectedPeriodName?: string | null
}

const data = ref<GeneralJournalResponse | null>(null)
const isLoading = ref(true)
const editMode = ref(false)
const entryToDelete = ref<JournalEntry | null>(null)
const isDeleting = ref(false)

let abortController: AbortController | null = null

const fetchJournalsGeneral = async () => {
    if (abortController) {
        abortController.abort()
    }
    abortController = new AbortController()
    isLoading.value = true

    try {
        data.value = (await getJournalsGeneralApi(abortController.signal)) as GeneralJournalResponse
    } catch (error: unknown) {
        if (!(error instanceof Error) || error.name !== 'AbortError') {
            console.error('Failed to fetch general journals:', error)
        }
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    fetchJournalsGeneral()
})

onUnmounted(() => {
    if (abortController) {
        abortController.abort()
    }
})

const handleDeleteConfirm = async () => {
    if (!entryToDelete.value) return
    isDeleting.value = true
    try {
        const response = await fetch(
            `/api/v1/journal-entries/${encodeURIComponent(String(entryToDelete.value.id))}`,
            { method: 'DELETE' },
        )
        if (!response.ok) {
            throw new Error(`Failed to delete journal entry (${response.status})`)
        }
        await fetchJournalsGeneral()
    } catch (err) {
        console.error('Failed to delete journal entry:', err)
    } finally {
        isDeleting.value = false
        entryToDelete.value = null
    }
}

const entries = computed<JournalEntry[]>(() => data.value?.entries || [])

const flatData = computed<FlatJournalRow[]>(() => {
    let tracker = ''
    let gIdx = 0

    return entries.value.flatMap((entry) => {
        const cur = formatDateDisplay(entry.entryDate)
        const showHeader = cur !== tracker
        if (showHeader) {
            tracker = cur
            gIdx++
        }

        return [...entry.lines]
            .sort((a, b) => a.lineOrder - b.lineOrder)
            .map((line, idx) => ({
                entryId: entry.id,
                transactionNumber: entry.transactionNumber,
                entryDate: entry.entryDate,
                createdAt: entry.createdAt,
                updatedAt: entry.updatedAt,
                lineId: line.id,
                lineOrder: line.lineOrder,
                debit: line.debit,
                credit: line.credit,
                lineDescription: line.lineDescription,
                accountName: line.accountName || line.account?.accountName || '-',
                referenceNumber:
                    line.referenceNumber || line.account?.referenceNumber || '-',
                isFirstLine: idx === 0,
                showHeader: idx === 0 && showHeader,
                formattedDate: cur,
                groupIdx: gIdx,
                originalEntry: entry,
            }))
    })
})

const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
        entryToDelete.value = null
    }
}
</script>

<template>
    <div v-if="isLoading" class="py-10 text-center text-xs flex justify-center gap-2">
        <Loader2 class="animate-spin" :size="16" /> Loading general entries...
    </div>

    <div v-else class="max-w-5xl space-y-6">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="flex gap-2 text-xl font-bold">
                    <FilePen class="text-purple-500" /> General Journal
                </h1>
                <p class="text-sm text-muted-foreground">
                    General entries
                    {{ data?.selectedPeriodName ? `(${data.selectedPeriodName})` : '' }} IDR
                </p>
            </div>
            <div class="flex gap-2">
                <Button as-child size="sm">
                    <RouterLink :to="{ path: '/journal-entry', query: { type: 'general' } }">
                        <Plus class="h-3.5 w-3.5" /> Add General
                    </RouterLink>
                </Button>
                <Button :variant="editMode ? 'secondary' : 'outline'" size="sm" @click="editMode = !editMode">
                    <Pencil class="h-3.5 w-3.5" /> Edit
                </Button>
            </div>
        </div>

        <Card>
            <CardContent class="p-0 overflow-x-auto">
                <GeneralJournalTable v-if="flatData.length" :flat-data="flatData" :edit-mode="editMode"
                    :is-deleting="isDeleting" @prompt-delete="entryToDelete = $event" />
                <JournalEmptyState v-else :selected-period-name="data?.selectedPeriodName" />
            </CardContent>
        </Card>

        <DeleteEntryDialog :open="!!entryToDelete" :transaction-number="entryToDelete?.transactionNumber"
            :is-deleting="isDeleting" @update:open="handleDialogOpenChange" @confirm="handleDeleteConfirm" />
    </div>
</template>