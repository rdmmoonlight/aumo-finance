<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { formatNumber } from '../lib/format'
import type { TrialRow } from '../lib/types'

defineProps<{
    rows: TrialRow[]
    totalDebit: number
    totalCredit: number
}>()
</script>

<template>
    <Card class="overflow-hidden">
        <CardContent class="p-0">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead class="w-[10%] pl-6 text-center text-caption">
                            Ref.
                        </TableHead>
                        <TableHead class="w-[50%] text-caption">Account</TableHead>
                        <TableHead class="w-[15%] text-caption">Type</TableHead>
                        <TableHead class="w-[12%] text-right text-caption">
                            Debit
                        </TableHead>
                        <TableHead class="w-[13%] pr-6 text-right text-caption">
                            Credit
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <template v-if="rows.length">
                        <TableRow v-for="row in rows" :key="String(row.accountId || `${row.type}-${row.accountName}`)">
                            <TableCell class="pl-6">
                                <div class="text-center">
                                    <Badge variant="outline" class="font-mono text-amber-500 text-label-small">
                                        {{ row.referenceNumber || '-' }}
                                    </Badge>
                                </div>
                            </TableCell>
                            <TableCell class="text-caption font-medium">
                                {{ row.accountName }}
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary" class="text-label-small">
                                    {{ row.type }}
                                </Badge>
                            </TableCell>
                            <TableCell class="text-right">
                                <div class="font-mono text-caption text-emerald-500 text-right">
                                    {{ (row.debit ?? 0) > 0 ? formatNumber(row.debit ?? 0) : '-' }}
                                </div>
                            </TableCell>
                            <TableCell class="pr-6">
                                <div class="font-mono text-caption text-red-500 text-right">
                                    {{ (row.credit ?? 0) > 0 ? formatNumber(row.credit ?? 0) : '-' }}
                                </div>
                            </TableCell>
                        </TableRow>
                    </template>
                    <TableRow v-else>
                        <TableCell :colspan="5" class="py-8 text-center text-caption text-muted-foreground">
                            No accounts found.
                        </TableCell>
                    </TableRow>
                </TableBody>
                <TableFooter>
                    <TableRow class="font-bold text-caption">
                        <TableCell :colspan="3" class="pl-6 text-right">
                            Total
                        </TableCell>
                        <TableCell class="text-right font-mono text-emerald-500">
                            {{ formatNumber(totalDebit) }}
                        </TableCell>
                        <TableCell class="pr-6 text-right font-mono text-red-500">
                            {{ formatNumber(totalCredit) }}
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </CardContent>
    </Card>
</template>