<script setup lang="ts">
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
    AlertTriangle,
    Calendar,
    EyeOff,
    Grid,
    Info,
    Loader2,
    TrendingUp,
} from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import type { WorksheetRow, WorksheetTotals, WorksheetViewModel } from './types'
import { formatNumber } from './utils'
import { getWorksheetApi } from './worksheet.api'
import WorksheetTable from './WorksheetTable.vue'

type WorksheetApiRow = {
    accountId?: number | string | null
    referenceNumber?: number | string | null
    accountName?: string | null
    type?: string | null
    normalBalanceIsDebit?: boolean | null
    tbDebit?: number | string | null
    tbCredit?: number | string | null
    adjDebit?: number | string | null
    adjCredit?: number | string | null
    adjTbDebit?: number | string | null
    adjTbCredit?: number | string | null
    isDebit?: number | string | null
    isCredit?: number | string | null
    bsDebit?: number | string | null
    bsCredit?: number | string | null
}

type WorksheetApiResponse = {
    rows?: WorksheetApiRow[]
    totals?: { netIncome?: number | string | null }
    hasPeriodSelected?: boolean
}

const data = ref<WorksheetApiResponse | null>(null)
const isLoading = ref(true)
const errorMessage = ref<string | null>(null)

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}

function getErrorMessage(error: unknown): string | undefined {
    if (!isRecord(error)) return undefined

    const response = isRecord(error.response) ? error.response : undefined
    const responseData = response && isRecord(response.data) ? response.data : undefined
    const errorData = isRecord(error.data) ? error.data : undefined
    const message = responseData?.message || errorData?.message || error.message
    return typeof message === 'string' ? message : undefined
}

let abortController: AbortController | null = null

async function fetchWorksheet() {
    abortController?.abort()
    abortController = new AbortController()

    isLoading.value = true
    errorMessage.value = null

    try {
        const result = await getWorksheetApi(abortController.signal)
        data.value = result as WorksheetApiResponse
    } catch (err: unknown) {
        if (
            isRecord(err) &&
            ((err.name === 'AbortError') || (err.code === 'ERR_CANCELED'))
        ) return
        errorMessage.value = getErrorMessage(err) || 'Gagal memuat data worksheet.'
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    fetchWorksheet()
})

onUnmounted(() => {
    abortController?.abort()
})

const vm = computed<WorksheetViewModel>(() => {
    const rawData = data.value
    if (!rawData) {
        return { rows: [], netIncome: 0, hasPeriodSelected: true }
    }

    const mappedRows: WorksheetRow[] = (rawData.rows || []).map((r) => ({
        accountId: Number(r.accountId) || 0,
        referenceNumber: Number(r.referenceNumber) || 0,
        accountName: r.accountName || '',
        type: r.type || '',
        normalBalanceIsDebit: r.normalBalanceIsDebit ?? true,
        unadjustedDebit: Number(r.tbDebit) || 0,
        unadjustedCredit: Number(r.tbCredit) || 0,
        adjustmentDebit: Number(r.adjDebit) || 0,
        adjustmentCredit: Number(r.adjCredit) || 0,
        adjustedDebit: Number(r.adjTbDebit) || 0,
        adjustedCredit: Number(r.adjTbCredit) || 0,
        incomeStatementDebit: Number(r.isDebit) || 0,
        incomeStatementCredit: Number(r.isCredit) || 0,
        financialPositionDebit: Number(r.bsDebit) || 0,
        financialPositionCredit: Number(r.bsCredit) || 0,
    }))

    return {
        rows: mappedRows,
        netIncome: Number(rawData.totals?.netIncome) || 0,
        hasPeriodSelected: rawData.hasPeriodSelected !== false,
    }
})

const totals = computed<WorksheetTotals>(() =>
    vm.value.rows.reduce(
        (acc, r) => {
            acc.unadjustedDebit += r.unadjustedDebit
            acc.unadjustedCredit += r.unadjustedCredit
            acc.adjustmentDebit += r.adjustmentDebit
            acc.adjustmentCredit += r.adjustmentCredit
            acc.adjustedDebit += r.adjustedDebit
            acc.adjustedCredit += r.adjustedCredit
            acc.isDebit += r.incomeStatementDebit
            acc.isCredit += r.incomeStatementCredit
            acc.bsDebit += r.financialPositionDebit
            acc.bsCredit += r.financialPositionCredit
            return acc
        },
        {
            unadjustedDebit: 0,
            unadjustedCredit: 0,
            adjustmentDebit: 0,
            adjustmentCredit: 0,
            adjustedDebit: 0,
            adjustedCredit: 0,
            isDebit: 0,
            isCredit: 0,
            bsDebit: 0,
            bsCredit: 0,
        },
    ),
)
</script>

<template>
    <div v-if="isLoading" class="py-16 text-center flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 class="animate-spin" :size="16" /> Loading Worksheet...
    </div>

    <div v-else class="space-y-6">
        <Alert v-if="errorMessage" variant="destructive">
            <AlertTriangle :size="16" />
            <AlertDescription>{{ errorMessage }}</AlertDescription>
        </Alert>

        <Card v-if="!vm.hasPeriodSelected" class="py-16 text-center border-dashed">
            <CardContent class="space-y-3">
                <EyeOff :size="36" class="mx-auto text-muted-foreground" />
                <h3 class="font-semibold">No Period Selected</h3>
                <Button as-child size="sm">
                    <RouterLink to="/periods" class="gap-1.5">
                        <Calendar :size="14" /> Go to Periods
                    </RouterLink>
                </Button>
            </CardContent>
        </Card>

        <template v-else>
            <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 class="text-h3 font-bold flex items-center gap-2">
                        <Grid class="text-sky-500" :size="22" /> 10-Column Worksheet
                    </h1>
                    <p class="text-ui text-muted-foreground mt-1">
                        Trial Balance → Adjustments → Adjusted TB → Income Statement →
                        Balance Sheet • IDR
                    </p>
                </div>
                <Button as-child variant="outline" size="sm" class="gap-1.5">
                    <RouterLink to="/reports/financial-statements/income-statement">
                        <TrendingUp :size="14" /> Income Statement
                    </RouterLink>
                </Button>
            </div>

            <Card class="overflow-hidden">
                <CardContent class="p-0 overflow-auto">
                    <WorksheetTable :rows="vm.rows" :totals="totals" :net-income="vm.netIncome" />
                </CardContent>
            </Card>

            <Alert class="bg-sky-500/10 border-sky-500/20">
                <Info :size="16" />
                <AlertDescription>
                    Net Income: <strong>{{ formatNumber(vm.netIncome) }}</strong> —
                    plugged from Income Statement to Balance Sheet.
                </AlertDescription>
            </Alert>
        </template>
    </div>
</template>