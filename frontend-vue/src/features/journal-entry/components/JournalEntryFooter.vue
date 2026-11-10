<template>
  <div class="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="space-y-1">
        <span class="text-sm font-medium text-muted-foreground">Status Keseimbangan</span>
        <div class="flex items-center gap-2">
          <Badge :variant="props.isBalanced ? 'default' : 'destructive'">
            {{ props.isBalanced ? 'Balanced (Seimbang)' : 'Unbalanced (Tidak Seimbang)' }}
          </Badge>
          <span v-if="!props.isBalanced" class="text-xs text-destructive">
            Selisih: {{ formatCurrency(Math.abs(props.totalDebit - props.totalCredit)) }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-6 font-mono text-sm">
        <div class="flex flex-col items-end">
          <span class="text-xs text-muted-foreground font-sans">Total Debit</span>
          <span class="text-base font-bold text-foreground">
            {{ formatCurrency(props.totalDebit) }}
          </span>
        </div>

        <div class="flex flex-col items-end">
          <span class="text-xs text-muted-foreground font-sans">Total Kredit</span>
          <span class="text-base font-bold text-foreground">
            {{ formatCurrency(props.totalCredit) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '../helpers'

interface Props {
  totalDebit?: number
  totalCredit?: number
  isBalanced?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  totalDebit: 0,
  totalCredit: 0,
  isBalanced: true,
})
</script>
