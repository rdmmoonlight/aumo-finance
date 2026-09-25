<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Period } from '~/types'

const { isNotificationsSlideoverOpen } = useDashboard()

const items = [[{
  label: 'New mail',
  icon: 'i-lucide-send',
  to: '/inbox'
}, {
  label: 'New customer',
  icon: 'i-lucide-user-plus',
  to: '/customers'
}]] satisfies DropdownMenuItem[][]

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
          <UTooltip text="Notifications" :shortcuts="['N']">
            <UButton
              color="neutral"
              variant="ghost"
              square
              @click="isNotificationsSlideoverOpen = true"
            >
              <UChip color="error" inset>
                <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
              </UChip>
            </UButton>
          </UTooltip>

          <UDropdownMenu :items="items">
            <UButton icon="i-lucide-plus" size="md" class="rounded-full" />
          </UDropdownMenu>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <!-- NOTE: The `-ms-1` class is used to align with the `DashboardSidebarCollapse` button here. -->
          <span class="-ms-1 px-2 flex items-center text-sm text-muted">
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
