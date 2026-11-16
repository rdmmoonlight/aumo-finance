<template>
  <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
    <!-- Tipe Jurnal -->
    <div class="space-y-2">
      <Label for="journalType">Tipe Jurnal</Label>
      <Select
        :model-value="journalType"
        :disabled="isReadOnly || isEditMode"
        @update:model-value="(val) => emit('update:journalType', String(val))"
      >
        <SelectTrigger id="journalType" class="w-full">
          <SelectValue placeholder="Pilih Tipe Jurnal" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="GENERAL">Jurnal Umum (General Journal)</SelectItem>
          <SelectItem value="ADJUSTMENT">Jurnal Penyesuaian (Adjusting)</SelectItem>
          <SelectItem value="CLOSING">Jurnal Penutup (Closing)</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Tanggal Transaksi -->
    <div class="space-y-2">
      <Label for="entryDate">Tanggal Transaksi</Label>
      <Input
        id="entryDate"
        type="date"
        :model-value="entryDate"
        :disabled="isReadOnly"
        @update:model-value="(val) => emit('update:entryDate', String(val))"
      />
    </div>

    <!-- Nomor Transaksi -->
    <div class="space-y-2">
      <Label for="transactionNumber">Nomor Transaksi</Label>
      <div class="relative">
        <Input
          id="transactionNumber"
          placeholder="Otomatis / Masukkan nomor"
          :model-value="transactionNumber"
          :disabled="isReadOnly"
          @update:model-value="(val) => emit('update:transactionNumber', String(val))"
        />
      </div>
    </div>

    <!-- Deskripsi / Catatan Utama (Full Width) -->
    <div class="space-y-2 md:col-span-3">
      <Label for="description">Deskripsi Utama</Label>
      <Input
        id="description"
        placeholder="Keterangan singkat transaksi..."
        :model-value="description || ''"
        :disabled="isReadOnly"
        @update:model-value="(val) => emit('update:description', String(val))"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Props {
  journalType?: string
  entryDate?: string
  transactionNumber?: string
  description?: string
  isReadOnly?: boolean
  isEditMode?: boolean
}

withDefaults(defineProps<Props>(), {
  journalType: 'GENERAL',
  entryDate: '',
  transactionNumber: '',
  description: '',
  isReadOnly: false,
  isEditMode: false,
})

const emit = defineEmits<{
  'update:journalType': [value: string]
  'update:entryDate': [value: string]
  'update:transactionNumber': [value: string]
  'update:description': [value: string]
}>()
</script>
