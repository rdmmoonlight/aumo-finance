<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-base">Informasi Transaksi</CardTitle>
    </CardHeader>
    <CardContent class="grid gap-4 sm:grid-cols-2">
      <!-- Tanggal Transaksi -->
      <div class="space-y-2">
        <label class="text-sm font-medium leading-none">
          Tanggal Transaksi <span class="text-destructive">*</span>
        </label>
        <Popover>
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              :class="[
                'w-full justify-start text-left font-normal',
                !props.transactionDate && 'text-muted-foreground',
              ]"
              :disabled="props.isReadOnly"
            >
              <CalendarIcon class="mr-2 h-4 w-4" />
              {{ props.transactionDate ? props.transactionDate : 'Pilih tanggal' }}
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-auto p-0" align="start">
            <Calendar
              :model-value="props.transactionDate ? parseDate(props.transactionDate) : undefined"
              initial-focus
              @update:model-value="(val) => emit('update:transactionDate', val?.toString() ?? '')"
            />
          </PopoverContent>
        </Popover>
      </div>

      <!-- Nomor Referensi -->
      <div class="space-y-2">
        <label class="text-sm font-medium leading-none">Nomor Referensi / Bukti</label>
        <Input
          :model-value="props.referenceNumber"
          placeholder="Contoh: BKK-001 atau INV/2026/001"
          :disabled="props.isReadOnly"
          @update:model-value="(val) => emit('update:referenceNumber', String(val))"
        />
      </div>

      <!-- Deskripsi / Keterangan -->
      <div class="space-y-2 sm:col-span-2">
        <label class="text-sm font-medium leading-none">Deskripsi / Keterangan Jurnal</label>
        <Textarea
          :model-value="props.description"
          placeholder="Tuliskan keterangan mengenai jurnal umum ini..."
          :disabled="props.isReadOnly"
          rows="2"
          @update:model-value="(val) => emit('update:description', String(val))"
        />
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { parseDate } from '@internationalized/date'
import { CalendarIcon } from 'lucide-vue-next'

interface Props {
  transactionDate?: string
  referenceNumber?: string
  description?: string
  isReadOnly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  transactionDate: '',
  referenceNumber: '',
  description: '',
  isReadOnly: false,
})

const emit = defineEmits<{
  'update:transactionDate': [value: string]
  'update:referenceNumber': [value: string]
  'update:description': [value: string]
}>()
</script>
