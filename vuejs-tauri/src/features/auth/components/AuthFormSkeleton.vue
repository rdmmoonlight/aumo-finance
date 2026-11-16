<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'
</script>

<template>
  <div class="space-y-4">
    <!-- Header Skeleton -->
    <div class="space-y-2">
      <Skeleton class="h-4 w-3/4 bg-zinc-800" />
      <Skeleton class="h-3 w-1/2 bg-zinc-800" />
    </div>

    <!-- Form Input Skeletons -->
    <div class="space-y-3 pt-2">
      <div class="space-y-1.5">
        <Skeleton class="h-3 w-16 bg-zinc-800" />
        <Skeleton class="h-10 w-full rounded-md bg-zinc-800" />
      </div>

      <div class="space-y-1.5">
        <Skeleton class="h-3 w-20 bg-zinc-800" />
        <Skeleton class="h-10 w-full rounded-md bg-zinc-800" />
      </div>
    </div>

    <!-- Button Skeleton -->
    <Skeleton class="h-10 w-full rounded-md bg-zinc-800" />

    <!-- Divider Skeleton -->
    <div class="relative flex items-center justify-center py-2">
      <Skeleton class="h-[1px] w-full bg-zinc-800" />
    </div>

    <!-- Social/Google Button Skeleton -->
    <Skeleton class="h-10 w-full rounded-md bg-zinc-800" />
  </div>
</template>
