<script setup lang="ts">
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useQuery } from '@tanstack/vue-query'
import { AlertTriangle, List, Loader2 } from 'lucide-vue-next'
import { computed } from 'vue'
import BalanceAlert from './components/BalanceAlert.vue'
import NoPeriodCard from './components/NoPeriodCard.vue'
import TrialBalancesTable from './components/TrialBalancesTable.vue'
import { normalizeTrialRows } from './lib/normalize'
import { getTrialBalanceApi } from './trial-balances.api'

type TrialBalanceError = Error & {
    status?: number
    data?: { message?: string }
    response?: { status?: number; data?: { message?: string } }
}

const { data, isLoading, isError, error } = useQuery({
    queryKey: ['reports', 'trial-balances', 'unadjusted'],
    queryFn: ({ signal }) => getTrialBalanceApi({ type: 'unadjusted' }, signal),
})

const noPeriod = computed(
    () =>
        (data.value !== null &&
            typeof data.value === 'object' &&
            'hasPeriodSelected' in data.value &&
            data.value.hasPeriodSelected === false) ||
        (isError.value &&
            ((error.value as TrialBalanceError | null)?.status === 404 ||
                (error.value as TrialBalanceError | null)?.response?.status === 404)),
)

const rows = computed(() => {
    if (!data.value || noPeriod.value) return []
    const response = data.value as { data?: unknown; rows?: unknown }
    const raw: unknown[] = Array.isArray(data.value)
        ? data.value
        : Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.rows)
            ? response.rows
            : []
    return normalizeTrialRows(raw)
})

const totalDebit = computed(() =>
    rows.value.reduce((s, r) => s + (Number(r.debit) || 0), 0),
)
const totalCredit = computed(() =>
    rows.value.reduce((s, r) => s + (Number(r.credit) || 0), 0),
)
const isBalanced = computed(() => Math.abs(totalDebit.value - totalCredit.value) < 0.01)

const errorMessage = computed(() => {
    const err = error.value as TrialBalanceError | null
    return (
        err?.data?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Gagal memuat laporan trial balance.'
    )
})
</script>

<template>
    <div v-if="isLoading" class="flex items-center justify-center gap-2 py-16 text-caption text-muted-foreground">
        <Loader2 class="animate-spin" :size="16" /> Loading unadjusted trial
        balance...
    </div>

    <div v-else class="space-y-6">
        <div>
            <h1 class="flex items-center gap-2 text-h3 font-bold">
                <List class="text-sky-500" :size="22" /> Unadjusted Trial Balance
            </h1>
            <p class="mt-1 text-ui text-muted-foreground">
                Before adjustments • IDR
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
            <TrialBalancesTable :rows="rows" :total-debit="totalDebit" :total-credit="totalCredit" />
            <BalanceAlert :is-balanced="isBalanced" balanced-text="Balanced: Debit = Credit"
                unbalanced-text="Unbalanced - check journal entries" />
        </template>
    </div>
</template>