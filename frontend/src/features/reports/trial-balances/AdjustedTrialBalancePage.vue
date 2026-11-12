<script setup lang="ts">
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useQuery } from '@tanstack/vue-query'
import { AlertTriangle, ListChecks, Loader2 } from 'lucide-vue-next'
import { computed } from 'vue'
import BalanceAlert from './components/BalanceAlert.vue'
import NoPeriodCard from './components/NoPeriodCard.vue'
import TrialTable from './components/TrialBalancesTable.vue'
import { normalizeTrialRows } from './lib/normalize'
import { getTrialBalanceApi } from './trial-balances.api'

const { data, isLoading, isError, error } = useQuery({
    queryKey: ['reports', 'trial-balances', 'adjusted'],
    queryFn: ({ signal }) => getTrialBalanceApi({ type: 'adjusted' }, signal),
})

const noPeriod = computed(
    () =>
        (data.value as { hasPeriodSelected?: boolean } | undefined)?.hasPeriodSelected === false ||
        (error.value as { status?: number } | null)?.status === 404 ||
        (error.value as { response?: { status?: number } } | null)?.response?.status === 404,
)

// 2. Normalisasi baris data
const rows = computed(() => {
    if (!data.value || noPeriod.value) return []
    const value: unknown = data.value
    if (Array.isArray(value)) return normalizeTrialRows(value)
    if (typeof value !== 'object' || value === null) return []

    const response = value as { data?: unknown; rows?: unknown }
    const raw: unknown[] = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.rows)
            ? response.rows
            : []
    return normalizeTrialRows(raw)
})

// 3. Kalkulasi total Debet & Kredit
const totalDebit = computed(() =>
    rows.value.reduce((s, r) => s + (Number(r.debit) || 0), 0),
)
const totalCredit = computed(() =>
    rows.value.reduce((s, r) => s + (Number(r.credit) || 0), 0),
)
const isBalanced = computed(() => Math.abs(totalDebit.value - totalCredit.value) < 0.01)

const errorMessage = computed(() => {
    const err = error.value as {
        data?: { message?: unknown }
        response?: { data?: { message?: unknown } }
        message?: unknown
    } | null
    const messages = [err?.data?.message, err?.response?.data?.message, err?.message]
    return (
        messages.find((message): message is string => typeof message === 'string') ||
        'Gagal memuat data adjusted trial balance.'
    )
})
</script>

<template>
    <div v-if="isLoading" class="flex items-center justify-center gap-2 py-16 text-caption text-muted-foreground">
        <Loader2 class="animate-spin" :size="16" /> Loading adjusted trial balance...
    </div>

    <div v-else class="space-y-6">
        <div>
            <h1 class="flex items-center gap-2 text-h3 font-bold">
                <ListChecks class="text-amber-500" :size="22" /> Adjusted Trial Balance
            </h1>
            <p class="mt-1 text-ui text-muted-foreground">
                After adjusting entries • IDR
            </p>
        </div>

        <Alert v-if="isError && !noPeriod" variant="destructive">
            <AlertTriangle :size="16" />
            <AlertDescription>
                {{ errorMessage }}
            </AlertDescription>
        </Alert>

        <NoPeriodCard v-if="noPeriod" />
        <template v-else>
            <TrialTable :rows="rows" :total-debit="totalDebit" :total-credit="totalCredit" />
            <BalanceAlert :is-balanced="isBalanced" balanced-text="Adjusted TB is balanced"
                unbalanced-text="Unbalanced - check adjusting entries" />
        </template>
    </div>
</template>