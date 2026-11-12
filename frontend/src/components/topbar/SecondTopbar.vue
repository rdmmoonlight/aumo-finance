<template>
  <div class="flex h-10 items-center justify-between pl-15 pr-4 bg-muted/20 text-xs">
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

    <!-- Status Periode -->
    <div class="flex items-center gap-4 text-muted-foreground">
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
import { computed } from 'vue'
import { useRoute } from 'vue-router'

export interface SelectedPeriod {
  periodName: string
  isClosed: boolean
}

defineProps<{
  selectedPeriod: SelectedPeriod | null
  isPeriodLoading?: boolean
}>()

const route = useRoute()

const pathSegments = computed(() => route.path.split('/').filter(Boolean))

// Ganti dengan formatSegment / getSegmentUrl lamamu kalau sudah ada
function formatSegment(segment: string) {
  return segment.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function getSegmentUrl(index: number) {
  return `/${pathSegments.value.slice(0, index + 1).join('/')}`
}
</script>
