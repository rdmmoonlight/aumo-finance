<script setup lang="ts">
import type { DashboardData } from '~/composables/useDashboardData'

defineProps<{
  dashboard: DashboardData | null | undefined
}>()
</script>

<template>
  <UCard class="shrink-0" :ui="{ body: 'px-0! pt-0! pb-3!' }">
    <template #header>
      <div>
        <p class="text-xs text-muted uppercase mb-1.5">
          Net Income
        </p>
        <p class="text-3xl text-highlighted font-semibold">
          ---
        </p>
      </div>
    </template>

    <div class="h-96" />
  </UCard>
</template>
