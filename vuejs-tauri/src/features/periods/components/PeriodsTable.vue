<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Loader2, MoreHorizontal } from 'lucide-vue-next'
import { formatPeriodDate } from '../format'
import type { Period } from '../types'

interface Props {
  periods: Period[]
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  periods: () => [],
  isLoading: false,
})

const emit = defineEmits<{
  'close-period': [id: number]
  'select-period': [id: number]
}>()
</script>

<template>
  <div class="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama Periode</TableHead>
          <TableHead>Tanggal Mulai</TableHead>
          <TableHead>Tanggal Selesai</TableHead>
          <TableHead>Status</TableHead>
          <TableHead class="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="props.isLoading">
          <TableRow>
            <TableCell colspan="5" class="h-24 text-center">
              <div class="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 class="h-4 w-4 animate-spin" />
                <span>Memuat data periode...</span>
              </div>
            </TableCell>
          </TableRow>
        </template>

        <template v-else-if="props.periods.length === 0">
          <TableRow>
            <TableCell colspan="5" class="h-24 text-center text-muted-foreground">
              Belum ada data periode.
            </TableCell>
          </TableRow>
        </template>

        <template v-else>
          <TableRow v-for="period in props.periods" :key="period.id">
            <TableCell class="font-medium">
              {{ period.periodName }}
            </TableCell>
            <TableCell>
              {{ formatPeriodDate(period.startDate) }}
            </TableCell>
            <TableCell>
              {{ formatPeriodDate(period.endDate) }}
            </TableCell>
            <TableCell>
              <div class="flex items-center gap-2">
                <Badge :variant="period.isClosed ? 'secondary' : 'default'">
                  {{ period.isClosed ? 'Tutup' : 'Terbuka' }}
                </Badge>
                <Badge v-if="period.isSelected" variant="outline">Dipilih</Badge>
              </div>
            </TableCell>
            <TableCell class="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" class="h-8 w-8 p-0">
                    <span class="sr-only">Buka menu</span>
                    <MoreHorizontal class="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem v-if="!period.isClosed" @click="emit('close-period', period.id)">
                    Tutup Periode
                  </DropdownMenuItem>
                  <DropdownMenuItem v-if="!period.isSelected" @click="emit('select-period', period.id)">
                    Pilih Periode
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>
</template>
