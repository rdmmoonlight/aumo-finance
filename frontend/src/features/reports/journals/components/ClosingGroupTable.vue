<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { computed } from 'vue'
import { formatNumberWithParen } from '../lib/format'
import type { ClosingJournalEntryGroup, ClosingJournalLine } from '../lib/types'

interface Props {
    group: ClosingJournalEntryGroup
    totals: {
        totalDebit: number
        totalCredit: number
    }
}

const props = defineProps<Props>()

const lines = computed<ClosingJournalLine[]>(() => props.group.lines || [])
</script>

<template>
    <Card class="w-full overflow-hidden">
        <CardHeader class="py-3 bg-muted/30 border-b">
            <CardTitle class="text-ui">{{ group.description }}</CardTitle>
        </CardHeader>
        <CardContent class="p-0">
            <Table class="min-w-">
                <TableHeader>
                    <TableRow>
                        <TableHead>
                            <div class="text-center text-caption">Ref.</div>
                        </TableHead>
                        <TableHead>Account</TableHead>
                        <TableHead>
                            <div class="text-right text-caption">Debit</div>
                        </TableHead>
                        <TableHead>
                            <div class="text-right pr-6 text-caption">Credit</div>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow v-for="(line, idx) in lines" :key="`${line.referenceNumber}-${line.accountName}-${idx}`">
                        <!-- Ref. -->
                        <TableCell>
                            <div class="text-center pl-6">
                                <Badge variant="outline" class="font-mono text-amber-500 text-label-small">
                                    {{ Number(line.referenceNumber) ? line.referenceNumber : '-' }}
                                </Badge>
                            </div>
                        </TableCell>

                        <!-- Account -->
                        <TableCell>
                            <div :class="[
                                'text-caption',
                                line.credit > 0 ? 'pl-6 text-muted-foreground' : 'font-medium',
                            ]">
                                {{ line.accountName }}
                            </div>
                        </TableCell>

                        <!-- Debit -->
                        <TableCell>
                            <div class="text-right font-mono text-caption text-emerald-500">
                                {{ line.debit > 0 ? formatNumberWithParen(line.debit) : '-' }}
                            </div>
                        </TableCell>

                        <!-- Credit -->
                        <TableCell>
                            <div class="text-right pr-6 font-mono text-caption text-red-500">
                                {{ line.credit > 0 ? formatNumberWithParen(line.credit) : '-' }}
                            </div>
                        </TableCell>
                    </TableRow>
                </TableBody>
                <TableFooter>
                    <TableRow class="font-bold">
                        <TableCell :colspan="2" class="text-right">
                            Total
                        </TableCell>
                        <TableCell class="text-right font-mono text-emerald-500">
                            {{ formatNumberWithParen(totals.totalDebit) }}
                        </TableCell>
                        <TableCell class="text-right pr-6 font-mono text-red-500">
                            {{ formatNumberWithParen(totals.totalCredit) }}
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </CardContent>
    </Card>
</template>