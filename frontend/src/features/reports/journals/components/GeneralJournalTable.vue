<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { Calendar, Clock, Pencil, Trash2 } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { formatDateTimeDisplay, formatNumber } from '../lib/format'
import type { FlatJournalRow } from '../lib/types'

interface Props {
    flatData: FlatJournalRow[]
    editMode: boolean
    isDeleting: boolean
}

defineProps<Props>()

const emit = defineEmits<{
    (e: 'promptDelete', entry: FlatJournalRow['originalEntry']): void
}>()
</script>

<template>
    <Table class="min-w- table-fixed">
        <TableHeader>
            <TableRow>
                <TableHead>
                    <span class="pl-4 text- font-semibold uppercase">
                        No. Transaksi
                    </span>
                </TableHead>
                <TableHead>
                    <span class="text- font-semibold uppercase">Account</span>
                </TableHead>
                <TableHead>
                    <span class="text- font-semibold uppercase">Description</span>
                </TableHead>
                <TableHead>
                    <div class="text-center text- font-semibold uppercase">
                        Ref #
                    </div>
                </TableHead>
                <TableHead>
                    <div class="text-right text- font-semibold uppercase">
                        Debit
                    </div>
                </TableHead>
                <TableHead>
                    <div class="text-right pr-4 text- font-semibold uppercase">
                        Credit
                    </div>
                </TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            <template v-for="(item, idx) in flatData" :key="`${item.entryId}-${idx}`">
                <TableRow v-if="item.showHeader" class="bg-muted/40 border-y">
                    <TableCell :colspan="6" class="py-1.5 pl-4 text-xs font-semibold">
                        <div class="flex items-center gap-1.5">
                            <Calendar class="h-3.5 w-3.5 text-amber-500" />
                            {{ item.formattedDate }}
                        </div>
                    </TableCell>
                </TableRow>

                <TableRow :class="[
                    item.groupIdx % 2 === 0 ? 'bg-muted/10' : '',
                    'hover:bg-muted/20 border-b-0',
                ]">
                    <!-- No. Transaksi -->
                    <TableCell class="py-2.5 text-xs h-10">
                        <div v-if="item.isFirstLine" class="flex items-center gap-2">
                            <span class="font-mono font-bold text-xs text-amber-500">
                                {{ item.transactionNumber }}
                            </span>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger as-child>
                                        <button type="button" class="text-muted-foreground">
                                            <Clock class="h-3.5 w-3.5" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent class="text-xs">
                                        <div>
                                            Dibuat: {{ formatDateTimeDisplay(item.createdAt) }}
                                        </div>
                                        <div v-if="item.updatedAt">
                                            Diubah: {{ formatDateTimeDisplay(item.updatedAt) }}
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <div v-if="editMode" class="inline-flex gap-1 ml-auto">
                                <Button as-child variant="ghost" size="icon" class="h-6 w-6">
                                    <RouterLink :to="{ path: '/journal-entry', query: { id: item.entryId } }">
                                        <Pencil class="h-3 w-3" />
                                    </RouterLink>
                                </Button>
                                <Button variant="ghost" size="icon" class="h-6 w-6 text-destructive"
                                    :disabled="isDeleting" @click="emit('promptDelete', item.originalEntry)">
                                    <Trash2 class="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    </TableCell>

                    <!-- Account -->
                    <TableCell class="py-2.5 text-xs h-10">
                        <div :class="item.debit > 0
                                ? 'font-semibold'
                                : 'pl-6 text-muted-foreground'
                            ">
                            {{ item.accountName ?? '' }}
                        </div>
                    </TableCell>

                    <!-- Description -->
                    <TableCell class="py-2.5 text-xs h-10">
                        {{ item.lineDescription || '-' }}
                    </TableCell>

                    <!-- Ref # -->
                    <TableCell class="py-2.5 text-xs h-10">
                        <Badge variant="outline" class="font-mono text-xs text-amber-500">
                            {{ String(item.referenceNumber ?? '-') }}
                        </Badge>
                    </TableCell>

                    <!-- Debit -->
                    <TableCell class="py-2.5 text-xs h-10">
                        <div class="text-right font-mono text-emerald-500">
                            {{
                                Number(item.debit || 0) > 0
                                    ? formatNumber(Number(item.debit))
                            : '-'
                            }}
                        </div>
                    </TableCell>

                    <!-- Credit -->
                    <TableCell class="py-2.5 text-xs h-10">
                        <div class="text-right pr-4 font-mono text-red-500">
                            {{
                                Number(item.credit || 0) > 0
                                    ? formatNumber(Number(item.credit))
                            : '-'
                            }}
                        </div>
                    </TableCell>
                </TableRow>
            </template>
        </TableBody>
    </Table>
</template>