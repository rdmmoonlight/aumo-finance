<template>
  <div class="space-y-4">
    <!-- Alert Pesan Error / Warning General -->
    <Alert v-if="props.errorMessage" variant="destructive">
      <AlertCircle class="h-4 w-4" />
      <AlertTitle>Terjadi Kesalahan</AlertTitle>
      <AlertDescription>
        {{ props.errorMessage }}
      </AlertDescription>
    </Alert>

    <!-- Alert Status Jurnal Tidak Seimbang (Unbalanced) -->
    <Alert v-if="!props.isBalanced && props.hasLines" variant="destructive">
      <AlertCircle class="h-4 w-4" />
      <AlertTitle>Jurnal Tidak Seimbang</AlertTitle>
      <AlertDescription>
        Total Debit ({{ formatCurrency(props.totalDebit) }}) dan Total Kredit ({{
          formatCurrency(props.totalCredit)
        }}) harus sama/seimbang sebelum diposting.
      </AlertDescription>
    </Alert>

    <!-- Alert Informasi Status Draft / Posted -->
    <Alert
      v-if="props.status === 'POSTED'"
      class="border-green-500/50 bg-green-50/50 text-green-900 dark:bg-green-950/20 dark:text-green-300"
    >
      <CheckCircle2 class="h-4 w-4 text-green-600 dark:text-green-400" />
      <AlertTitle>Jurnal Terposting</AlertTitle>
      <AlertDescription>
        Entri jurnal ini telah diposting ke buku besar dan nilainya telah memperbarui saldo akun.
      </AlertDescription>
    </Alert>

    <Alert v-else-if="props.status === 'CANCELLED'" variant="destructive">
      <AlertCircle class="h-4 w-4" />
      <AlertTitle>Jurnal Dibatalkan</AlertTitle>
      <AlertDescription>
        Entri jurnal ini telah dibatalkan dan tidak berlaku lagi dalam laporan keuangan.
      </AlertDescription>
    </Alert>
  </div>
</template>

<script setup lang="ts">
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2 } from 'lucide-vue-next'
import { formatCurrency } from '../helpers'

interface Props {
  errorMessage?: string | null
  isBalanced?: boolean
  hasLines?: boolean
  totalDebit?: number
  totalCredit?: number
  status?: 'DRAFT' | 'POSTED' | 'CANCELLED' | string
}

const props = withDefaults(defineProps<Props>(), {
  errorMessage: null,
  isBalanced: true,
  hasLines: false,
  totalDebit: 0,
  totalCredit: 0,
  status: 'DRAFT',
})
</script>
