<script setup lang="ts">
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ArrowRight, Info, Loader2, Lock } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import ClosingGroupTable from './components/ClosingGroupTable.vue'
import NoPeriodState from './components/NoPeriodState.vue'
import { getJournalsClosingApi } from './journals.api.ts'
import { formatNumberWithParen } from './lib/format.ts'
import type { ClosingJournalViewModel } from './lib/types.ts'

type ClosingJournalResponse = {
    hasPeriodSelected?: boolean
    isPeriodClosed?: boolean
    selectedPeriodName?: string
    netIncome?: number
    retainedEarningsAccountName?: string
    groups?: ClosingJournalViewModel['groups']
    closingJournal?: {
        netIncome?: number
        retainedEarningsAccountName?: string
        groups?: ClosingJournalViewModel['groups']
    }
}

const data = ref<ClosingJournalResponse | null>(null)
const isLoading = ref(true)
const isError = ref(false)

let abortController: AbortController | null = null

const fetchClosingJournal = async () => {
    if (abortController) {
        abortController.abort()
    }
    abortController = new AbortController()
    isLoading.value = true
    isError.value = false

    try {
        data.value = (await getJournalsClosingApi(
            abortController.signal,
        )) as ClosingJournalResponse
    } catch (error: unknown) {
        const errorName =
            error instanceof Error
                ? error.name
                : typeof error === 'object' && error !== null && 'name' in error
                    ? error.name
                    : undefined
        if (errorName !== 'AbortError') {
            isError.value = true
        }
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    fetchClosingJournal()
})

onUnmounted(() => {
    if (abortController) {
        abortController.abort()
    }
})

const viewState = computed(() => {
    const d = data.value
    if (!d || d?.hasPeriodSelected === false) {
        return {
            noPeriod: true,
            notClosed: false,
            vm: {
                netIncome: 0,
                retainedEarningsAccountName: 'Retained Earnings',
                groups: [],
            } as ClosingJournalViewModel,
        }
    }
    if (d?.isPeriodClosed === false) {
        return {
            noPeriod: false,
            notClosed: true,
            vm: {
                netIncome: 0,
                retainedEarningsAccountName: 'Retained Earnings',
                groups: [],
            } as ClosingJournalViewModel,
        }
    }

    const cj = d?.closingJournal || d
    return {
        noPeriod: false,
        notClosed: false,
        vm: {
            netIncome: Number(cj?.netIncome) || 0,
            retainedEarningsAccountName:
                cj?.retainedEarningsAccountName || 'Retained Earnings',
            groups: (cj?.groups || []).map((g) => ({
                description: g.description,
                lines: g.lines,
            })),
        } as ClosingJournalViewModel,
    }
})

const totals = computed(() =>
    viewState.value.vm.groups.map((g) => ({
        totalDebit: g.lines.reduce((s, l) => s + (l.debit || 0), 0),
        totalCredit: g.lines.reduce((s, l) => s + (l.credit || 0), 0),
    })),
)
</script>

<template>
    <div v-if="isLoading" class="py-16 text-center text-xs flex justify-center items-center gap-2">
        <Loader2 class="animate-spin" :size="16" /> Loading...
    </div>

    <div v-else-if="isError" class="py-16 text-center text-xs text-destructive">
        Gagal mengambil data laporan jurnal penutup dari server.
    </div>

    <NoPeriodState v-else-if="viewState.noPeriod" />

    <div v-else-if="viewState.notClosed" class="space-y-6">
        <h1 class="text-xl font-bold flex items-center gap-2">
            <Lock class="text-amber-500" :size="22" /> Closing Journal
        </h1>
        <Alert class="bg-amber-500/10">
            <Info :size="16" />
            <AlertDescription class="text-xs space-y-3">
                <p>
                    Periode
                    {{
                        data?.selectedPeriodName
                            ? `"${data.selectedPeriodName}" `
                            : 'ini '
                    }}
                    belum ditutup (closed), sehingga Jurnal Penutup belum dibuat. Jurnal
                    ini baru tersedia setelah periode ditutup melalui halaman Periods.
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
        <div class="flex justify-between items-center">
            <h1 class="text-xl font-bold flex items-center gap-2">
                <Lock class="text-amber-500" :size="22" /> Closing Journal
            </h1>
            <Button as-child variant="outline" size="sm">
                <RouterLink to="/reports/trial-balances/post-closing">
                    <ArrowRight :size="14" /> Post-Closing
                </RouterLink>
            </Button>
        </div>

        <div v-if="viewState.vm.groups.length === 0" class="py-12 text-center text-xs text-muted-foreground">
            Belum ada akun pendapatan atau beban yang bersaldo pada periode ini,
            sehingga tidak ada jurnal penutup.
        </div>

        <ClosingGroupTable v-for="(g, i) in viewState.vm.groups" :key="i" :group="g" :totals="totals[i]" />

        <Alert class="bg-sky-500/10">
            <Info :size="16" />
            <AlertDescription class="text-xs">
                Net Income
                <strong>{{ formatNumberWithParen(viewState.vm.netIncome) }}</strong>
                will transfer to
                <strong>{{ viewState.vm.retainedEarningsAccountName }}</strong>
            </AlertDescription>
        </Alert>
    </div>
</template>