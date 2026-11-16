<script setup lang="ts">
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/vue-query'
import {
    AlertTriangle,
    ArrowRight,
    Info,
    Loader2,
    ShieldCheck,
} from 'lucide-vue-next'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import BalanceAlert from './components/BalanceAlert.vue'
import NoPeriodCard from './components/NoPeriodCard.vue'
import TrialBalancesTable from './components/TrialBalancesTable.vue'
import { normalizeTrialRows } from './lib/normalize'
import type { TrialRow } from './lib/types'
import { getTrialBalanceApi } from './trial-balances.api'

type TrialBalanceError = {
    status?: number
    response?: { status?: number; data?: { message?: string } }
    data?: { message?: string }
    message?: string
}

type TrialBalanceResponse = {
    hasPeriodSelected?: boolean
    isPeriodClosed?: boolean
    selectedPeriodName?: string
    data?: unknown
    rows?: unknown
}

const { data, isLoading, isError, error } = useQuery({
    queryKey: ['reports', 'trial-balances', 'post-closing'],
    queryFn: ({ signal }) => getTrialBalanceApi({ type: 'post-closing' }, signal),
})

const statusFlags = computed(() => {
    const raw = data.value as TrialBalanceResponse | undefined
    const err = error.value as TrialBalanceError | null | undefined
    const is404 = err?.status === 404 || err?.response?.status === 404
    const noPeriodSelected = raw?.hasPeriodSelected === false

    return {
        noPeriod: is404 || noPeriodSelected,
        notClosed: !noPeriodSelected && raw?.isPeriodClosed === false,
    }
})

const noPeriod = computed(() => statusFlags.value.noPeriod)
const notClosed = computed(() => statusFlags.value.notClosed)

const rows = computed<TrialRow[]>(() => {
    if (!data.value || noPeriod.value || notClosed.value) return []
    const response = data.value as TrialBalanceResponse
    const rawValue: unknown = Array.isArray(data.value)
        ? data.value
        : response.data ?? response.rows
    const raw: unknown[] = Array.isArray(rawValue) ? rawValue : []
    return normalizeTrialRows(raw)
})

const totalDebit = computed(() =>
    rows.value.reduce((s, r) => s + (Number(r.debit) || 0), 0),
)
const totalCredit = computed(() =>
    rows.value.reduce((s, r) => s + (Number(r.credit) || 0), 0),
)
const isBalanced = computed(() => Math.abs(totalDebit.value - totalCredit.value) < 0.01)

const selectedPeriodName = computed(
    () => (data.value as TrialBalanceResponse | undefined)?.selectedPeriodName,
)

const errorMessage = computed(() => {
    const err = error.value as TrialBalanceError | null | undefined
    return (
        err?.data?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to load post-closing trial balance.'
    )
})
</script>

<template>
    <div v-if="isLoading"
        class="py-16 text-center text-caption text-muted-foreground flex items-center justify-center gap-2">
        <Loader2 class="animate-spin" :size="16" /> Loading post-closing...
    </div>

    <div v-else-if="notClosed" class="space-y-6">
        <div>
            <h1 class="text-h3 font-bold flex items-center gap-2">
                <ShieldCheck class="text-emerald-500" :size="22" /> Post-Closing Trial
                Balance
            </h1>
            <p class="text-ui text-muted-foreground mt-1">
                After closing entries • Only permanent accounts • IDR
            </p>
        </div>
        <Alert class="bg-amber-500/10">
            <Info :size="16" />
            <AlertDescription class="text-xs space-y-3">
                <p>
                    Periode
                    {{ selectedPeriodName ? `"${selectedPeriodName}" ` : 'ini ' }}
                    belum ditutup (closed), sehingga Post-Closing Trial Balance belum
                    dibuat. Laporan ini baru tersedia setelah periode ditutup melalui
                    halaman Periods.
                </p>
                <Button as-child variant="outline" size="sm">
                    <RouterLink to="/periods">
                        <ArrowRight :size="14" /> Ke halaman Periods
                    </RouterLink>
                </Button>
            </AlertDescription>
        </Alert>
    </div>

    <div v-else class="space-y-6">
        <div>
            <h1 class="text-h3 font-bold flex items-center gap-2">
                <ShieldCheck class="text-emerald-500" :size="22" /> Post-Closing Trial
                Balance
            </h1>
            <p class="text-ui text-muted-foreground mt-1">
                After closing entries • Only permanent accounts • IDR
            </p>
        </div>

        <Alert v-if="isError" variant="destructive">
            <AlertTriangle :size="16" />
            <AlertDescription>
                {{ errorMessage }}
            </AlertDescription>
        </Alert>

        <NoPeriodCard v-if="noPeriod" message="Select a period to view post-closing balance." />
        <template v-else>
            <TrialBalancesTable :rows="rows" :total-debit="totalDebit" :total-credit="totalCredit" />
            <BalanceAlert :is-balanced="isBalanced" balanced-text="Post-closing TB is balanced - ready for next period"
                unbalancedText="Out of balance - check closing entries" />
        </template>
    </div>
</template>