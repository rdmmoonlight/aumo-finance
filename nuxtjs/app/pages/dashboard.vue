<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Period } from '~/types'

definePageMeta({
  // middleware: ['auth'] dihapus karena middleware bertipe global (auth.global.ts)
})

const { isNotificationsSlideoverOpen } = useDashboard()

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

const period = ref<Period>('monthly')

const { data: dashboard, pending } = useDashboardData(period)
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Home" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
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

          <UDropdownMenu :items="items">
            <UButton icon="i-lucide-plus" size="md" class="rounded-full" aria-label="Add new" />
          </UDropdownMenu>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <span class="-ms-1 px-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
            {{ dashboard?.selectedPeriodName ?? 'Current Period' }}
          </span>

          <HomePeriodSelect v-model="period" />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <HomeStats :dashboard="dashboard" :pending="pending" />
      <HomeChart :dashboard="dashboard" />
      <HomeSales :dashboard="dashboard" :pending="pending" />
    </template>
  </UDashboardPanel>
</template>