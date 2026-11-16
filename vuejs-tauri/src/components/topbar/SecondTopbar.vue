<template>
  <!-- Tetap pertahankan pl-75 dan tambahkan 'relative' agar posisi breadcrumb tidak bergeser -->
  <div class="relative flex h-10 items-center pl-75 pr-4 bg-muted/20 text-xs">

    <!-- Kotak Periode: mengisi celah kosong selebar w-75 di sebelah kiri breadcrumb -->
    <div class="absolute left-0 top-0 flex h-full w-75 items-center px-4 text-muted-foreground">
      <Badge v-if="selectedPeriod" variant="outline" :class="[
        'gap-1.5 font-medium text-xs max-w-full truncate',
        selectedPeriod.isClosed
          ? 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10'
          : 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
      ]">
        <span :class="[
          'h-1.5 w-1.5 shrink-0 rounded-full',
          selectedPeriod.isClosed ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse',
        ]" />
        <span class="truncate">
          Periode: {{ selectedPeriod.periodName }}
          {{ selectedPeriod.isClosed ? ' (Closed)' : ' (Aktif)' }}
        </span>
      </Badge>

      <Badge v-else variant="outline" class="gap-1.5 font-medium text-xs text-muted-foreground">
        <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
        {{ isPeriodLoading ? 'Memuat periode...' : 'Belum Ada Periode Dipilih' }}
      </Badge>
    </div>

    <!-- Dynamic Breadcrumbs (Posisi 100% tetap di pl-75) -->
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/home" class="text-xs">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <template v-for="(segment, index) in pathSegments" :key="`${segment}-${index}`">
          <template v-if="!(segment === 'home' && index === 0)">
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage v-if="index === pathSegments.length - 1" class="text-xs font-semibold">
                {{ formatSegment(segment) }}
              </BreadcrumbPage>
              <BreadcrumbLink v-else :href="getSegmentUrl(index)" class="text-xs">
                {{ formatSegment(segment) }}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </template>
        </template>
      </BreadcrumbList>
    </Breadcrumb>
  </div>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useGetPeriodsQuery, type PeriodItem } from '@/features/periods/periods.api'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const { data: periodsData, isLoading: isPeriodLoading } = useGetPeriodsQuery()

const selectedPeriod = computed<PeriodItem | null>(() => {
  const raw = periodsData.value
  if (!raw) return null

  let list: PeriodItem[] = []
  let selectedId: number | null | undefined = null

  if (Array.isArray(raw)) {
    list = raw
  } else if ('periods' in raw && Array.isArray(raw.periods)) {
    list = raw.periods
    selectedId = raw.selectedPeriodId
  } else if ('items' in raw && Array.isArray(raw.items)) {
    list = raw.items
  }

  return (
    list.find((p) => p.isSelected) ??
    (selectedId != null ? list.find((p) => p.id === selectedId) : null) ??
    null
  )
})

const pathSegments = computed(() => route.path.split('/').filter(Boolean))

function formatSegment(segment: string) {
  return segment.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function getSegmentUrl(index: number) {
  return `/${pathSegments.value.slice(0, index + 1).join('/')}`
}
</script>