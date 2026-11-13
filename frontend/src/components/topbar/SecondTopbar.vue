<template>
  <!-- Ubah pl-75 menjadi pl-4 (atau atur sesuai kebutuhan) dan gunakan gap-4 -->
  <div class="flex h-10 items-center justify-start gap-4 px-4 bg-muted/20 text-xs">
    <!-- Status Periode (Sekarang di sebelah kiri) -->
    <div class="flex items-center shrink-0 text-muted-foreground">
      <Badge v-if="selectedPeriod" variant="outline" :class="[
        'gap-1.5 font-medium text-xs',
        selectedPeriod.isClosed
          ? 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10'
          : 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
      ]">
        <span :class="[
          'h-1.5 w-1.5 rounded-full',
          selectedPeriod.isClosed ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse',
        ]" />
        Periode: {{ selectedPeriod.periodName }}
        {{ selectedPeriod.isClosed ? ' (Closed)' : ' (Aktif)' }}
      </Badge>

      <Badge v-else variant="outline" class="gap-1.5 font-medium text-xs text-muted-foreground">
        <span class="h-1.5 w-1.5 rounded-full bg-slate-400" />
        {{ isPeriodLoading ? 'Memuat periode...' : 'Belum Ada Periode Dipilih' }}
      </Badge>
    </div>

    <!-- Pembatas tipis opsional antara badge periode & breadcrumb -->
    <div class="h-4 w-[1px] bg-border" />

    <!-- Dynamic Breadcrumbs -->
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