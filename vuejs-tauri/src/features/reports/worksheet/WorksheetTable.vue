<script setup lang="ts">
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { WorksheetRow, WorksheetTotals } from './types';
import { formatNumber } from './utils';

defineProps<{
    rows: WorksheetRow[]
    totals: WorksheetTotals
    netIncome: number
}>()

const fmt = (v: number | null | undefined) => (v ? formatNumber(v) : '-')
</script>

<template>
    <div class="rounded-md border overflow-auto">
        <Table class="text-caption">
            <TableCaption>Worksheet - 10 column accounting worksheet</TableCaption>
            <TableHeader>
                <TableRow class="bg-muted/50">
                    <TableHead :rowspan="2" class="sticky left-0 z-20 bg-muted/50 min-w-">
                        Account
                    </TableHead>
                    <TableHead :colspan="2" class="text-center border-l">
                        Trial Balance
                    </TableHead>
                    <TableHead :colspan="2" class="text-center border-l">
                        Adjustments
                    </TableHead>
                    <TableHead :colspan="2" class="text-center border-l">
                        Adjusted TB
                    </TableHead>
                    <TableHead :colspan="2" class="text-center border-l">
                        Income Statement
                    </TableHead>
                    <TableHead :colspan="2" class="text-center border-l">
                        Balance Sheet
                    </TableHead>
                </TableRow>
                <TableRow class="bg-muted/50">
                    <TableHead class="text-right">Dr</TableHead>
                    <TableHead class="text-right">Cr</TableHead>
                    <TableHead class="text-right border-l">Dr</TableHead>
                    <TableHead class="text-right">Cr</TableHead>
                    <TableHead class="text-right border-l">Dr</TableHead>
                    <TableHead class="text-right">Cr</TableHead>
                    <TableHead class="text-right border-l">Dr</TableHead>
                    <TableHead class="text-right">Cr</TableHead>
                    <TableHead class="text-right border-l">Dr</TableHead>
                    <TableHead class="text-right">Cr</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                <template v-if="rows.length">
                    <TableRow v-for="row in rows" :key="row.accountId">
                        <TableCell class="sticky left-0 z-10 bg-background">
                            <div class="flex items-center gap-2">
                                <Badge variant="outline" class="font-mono text-">
                                    {{ row.referenceNumber }}
                                </Badge>
                                <span>{{ row.accountName }}</span>
                            </div>
                        </TableCell>
                        <TableCell class="text-right font-mono">
                            {{ fmt(row.unadjustedDebit) }}
                        </TableCell>
                        <TableCell class="text-right font-mono">
                            {{ fmt(row.unadjustedCredit) }}
                        </TableCell>
                        <TableCell class="text-right font-mono text-amber-500 border-l">
                            {{ fmt(row.adjustmentDebit) }}
                        </TableCell>
                        <TableCell class="text-right font-mono text-amber-500">
                            {{ fmt(row.adjustmentCredit) }}
                        </TableCell>
                        <TableCell class="text-right font-mono border-l">
                            {{ fmt(row.adjustedDebit) }}
                        </TableCell>
                        <TableCell class="text-right font-mono">
                            {{ fmt(row.adjustedCredit) }}
                        </TableCell>
                        <TableCell class="text-right font-mono text-emerald-500 border-l">
                            {{ fmt(row.incomeStatementDebit) }}
                        </TableCell>
                        <TableCell class="text-right font-mono text-emerald-500">
                            {{ fmt(row.incomeStatementCredit) }}
                        </TableCell>
                        <TableCell class="text-right font-mono text-sky-500 border-l">
                            {{ fmt(row.financialPositionDebit) }}
                        </TableCell>
                        <TableCell class="text-right font-mono text-sky-500">
                            {{ fmt(row.financialPositionCredit) }}
                        </TableCell>
                    </TableRow>
                </template>
                <TableRow v-else>
                    <TableCell :colspan="11" class="h-24 text-center text-muted-foreground">
                        No worksheet rows.
                    </TableCell>
                </TableRow>
            </TableBody>

            <TableFooter class="font-bold">
                <TableRow>
                    <TableCell class="sticky left-0 bg-muted text-right">
                        Total
                    </TableCell>
                    <TableCell class="text-right font-mono">
                        {{ formatNumber(totals.unadjustedDebit) }}
                    </TableCell>
                    <TableCell class="text-right font-mono">
                        {{ formatNumber(totals.unadjustedCredit) }}
                    </TableCell>
                    <TableCell class="text-right font-mono text-amber-500 border-l">
                        {{ formatNumber(totals.adjustmentDebit) }}
                    </TableCell>
                    <TableCell class="text-right font-mono text-amber-500">
                        {{ formatNumber(totals.adjustmentCredit) }}
                    </TableCell>
                    <TableCell class="text-right font-mono border-l">
                        {{ formatNumber(totals.adjustedDebit) }}
                    </TableCell>
                    <TableCell class="text-right font-mono">
                        {{ formatNumber(totals.adjustedCredit) }}
                    </TableCell>
                    <TableCell class="text-right font-mono text-emerald-500 border-l">
                        {{ formatNumber(totals.isDebit) }}
                    </TableCell>
                    <TableCell class="text-right font-mono text-emerald-500">
                        {{ formatNumber(totals.isCredit) }}
                    </TableCell>
                    <TableCell class="text-right font-mono text-sky-500 border-l">
                        {{ formatNumber(totals.bsDebit) }}
                    </TableCell>
                    <TableCell class="text-right font-mono text-sky-500">
                        {{ formatNumber(totals.bsCredit) }}
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell :colspan="7" class="sticky left-0 bg-muted text-right">
                        Net Income (plug)
                    </TableCell>
                    <TableCell class="text-right font-mono text-emerald-500 border-l">
                        {{ netIncome >= 0 ? formatNumber(netIncome) : '-' }}
                    </TableCell>
                    <TableCell class="text-right font-mono text-emerald-500">
                        {{ netIncome < 0 ? formatNumber(Math.abs(netIncome)) : '-' }} </TableCell>
                            <TableCell class="text-right font-mono text-sky-500 border-l">
                                {{ netIncome < 0 ? formatNumber(Math.abs(netIncome)) : '-' }} </TableCell>
                                    <TableCell class="text-right font-mono text-sky-500">
                                        {{ netIncome >= 0 ? formatNumber(netIncome) : '-' }}
                                    </TableCell>
                </TableRow>
                <TableRow class="bg-primary/5">
                    <TableCell :colspan="7" class="sticky left-0 bg-primary/5 text-right">
                        Total (after plug)
                    </TableCell>
                    <TableCell class="text-right font-mono text-emerald-500 border-l">
                        {{ formatNumber(totals.isDebit + (netIncome >= 0 ? netIncome : 0)) }}
                    </TableCell>
                    <TableCell class="text-right font-mono text-emerald-500">
                        {{ formatNumber(totals.isCredit + (netIncome < 0 ? Math.abs(netIncome) : 0)) }} </TableCell>
                            <TableCell class="text-right font-mono text-sky-500 border-l">
                                {{ formatNumber(totals.bsDebit + (netIncome < 0 ? Math.abs(netIncome) : 0)) }}
                                    </TableCell>
                                    <TableCell class="text-right font-mono text-sky-500">
                                        {{ formatNumber(totals.bsCredit + (netIncome >= 0 ? netIncome : 0)) }}
                                    </TableCell>
                </TableRow>
            </TableFooter>
        </Table>
    </div>
</template>