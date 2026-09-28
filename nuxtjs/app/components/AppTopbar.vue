<!-- components/AppTopbar.vue -->
<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  title?: string
}>()

// Mengakses state slideover notifikasi global dari dashboard
const { isNotificationsSlideoverOpen } = useDashboard()

// Menu dropdown aksi cepat global
const items = [[
  {
    label: 'New mail',
    icon: 'i-lucide-send',
    to: '/inbox'
  },
  {
    label: 'New customer',
    icon: 'i-lucide-user-plus',
    to: '/customers'
  }
]] satisfies DropdownMenuItem[][]
</script>

<template>
  <UDashboardNavbar :title="title" :ui="{ right: 'gap-3' }">
    <template #leading>
      <!-- Tombol toggle/collapse sidebar -->
      <UDashboardSidebarCollapse />
    </template>

    <template #right>
      <!-- Slot kustom jika halaman butuh tombol tambahan -->
      <slot name="right" />

      <!-- Tombol Notifikasi Global -->
      <UTooltip title="Notifications" :shortcuts="['N']">
        <UButton
          color="neutral"
          variant="ghost"
          square
          aria-label="Notifications"
          @click="isNotificationsSlideoverOpen = true"
        >
          <UChip color="error" inset>
            <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
          </UChip>
        </UButton>
      </UTooltip>

      <!-- Dropdown Quick Actions Global -->
      <UDropdownMenu :items="items">
        <UButton
          icon="i-lucide-plus"
          size="md"
          class="rounded-full"
          aria-label="Add new"
        />
      </UDropdownMenu>
    </template>
  </UDashboardNavbar>
</template>
