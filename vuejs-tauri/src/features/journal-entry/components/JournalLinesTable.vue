<template>
  <div class="space-y-4">
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-12.5 text-center">#</TableHead>
            <TableHead class="w-75">Akun Buku Besar</TableHead>
            <TableHead class="w-45 text-right">Debit</TableHead>
            <TableHead class="w-45 text-right">Kredit</TableHead>
            <TableHead v-if="!props.isReadOnly" class="w-15 text-center">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="props.lines.length === 0">
            <TableRow>
              <TableCell
                :colspan="props.isReadOnly ? 4 : 5"
                class="h-24 text-center text-muted-foreground"
              >
                Belum ada rincian baris jurnal. Silakan tambah baris transaksi.
              </TableCell>
            </TableRow>
          </template>

          <template v-else>
            <TableRow v-for="(line, index) in props.lines" :key="index">
              <TableCell class="text-center font-medium">
                {{ index + 1 }}
              </TableCell>

              <!-- Akun -->
              <TableCell>
                <Select
                  :model-value="line.accountId"
                  :disabled="props.isReadOnly"
                  @update:model-value="
                    (val) => emit('update-line', index, 'accountId', String(val))
                  "
                >
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Pilih Akun" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="account in props.accounts"
                      :key="account.id"
                      :value="account.id"
                    >
                      {{ account.code }} - {{ account.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>

              <!-- Debit -->
              <TableCell>
                <Input
                  type="number"
                  min="0"
                  class="text-right font-mono"
                  :model-value="line.debit"
                  :disabled="props.isReadOnly"
                  @update:model-value="
                    (val) => emit('update-line', index, 'debit', Number(val) || 0)
                  "
                />
              </TableCell>

              <!-- Kredit -->
              <TableCell>
                <Input
                  type="number"
                  min="0"
                  class="text-right font-mono"
                  :model-value="line.credit"
                  :disabled="props.isReadOnly"
                  @update:model-value="
                    (val) => emit('update-line', index, 'credit', Number(val) || 0)
                  "
                />
              </TableCell>

              <!-- Hapus Baris -->
              <TableCell v-if="!props.isReadOnly" class="text-center">
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8 text-destructive hover:text-destructive"
                  @click="emit('remove-line', index)"
                >
                  <Trash2 class="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <!-- Tombol Tambah Baris -->
    <div v-if="!props.isReadOnly" class="flex justify-start">
      <Button variant="outline" size="sm" @click="emit('add-line')">
        <Plus class="mr-2 h-4 w-4" />
        Tambah Baris
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Trash2 } from 'lucide-vue-next'

import type { JournalEntryLineDto as JournalLine } from '../journal-entry.api'

interface AccountOption {
  id: string
  code: string
  name: string
}

interface Props {
  lines: JournalLine[]
  accounts: AccountOption[]
  isReadOnly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  lines: () => [],
  accounts: () => [],
  isReadOnly: false,
})

const emit = defineEmits<{
  'add-line': []
  'remove-line': [index: number]
  'update-line': [index: number, field: keyof JournalLine, value: JournalLine[keyof JournalLine]]
}>()
</script>
