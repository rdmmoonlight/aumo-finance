<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Period } from '~/types'

// Proteksi Halaman: Hanya user yang sudah login yang bisa akses
definePageMeta({
  middleware: ['auth']
})

const { isNotificationsSlideoverOpen } = useDashboard()

// Menu dropdown aksi cepat
const items = [[{
  label: 'New mail',
  icon: 'i-lucide-send',
  to: '/inbox'
}, {
  label: 'New customer',
  icon: 'i-lucide-user-plus',
  to: '/customers'
}]] satisfies DropdownMenuItem[][]

// State periode data dashboard
const period = ref<Period>('monthly')

// Ambil data dashboard berdasarkan periode
const { data: dashboard, pending } = useDashboardData(period)

// SEO Metadata khusus untuk pengguna yang sudah login
useSeoMeta({
  title: 'Dashboard Utama - Workspace Anda',
  description: 'Ringkasan performa bisnis dan aktivitas terbaru Anda.'
})
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Dashboard" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <!-- Tombol Notifikasi -->
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

          <!-- Dropdown Aksi Cepat -->
          <UDropdownMenu :items="items">
            <UButton icon="i-lucide-plus" size="md" class="rounded-full" />
          </UDropdownMenu>
        </template>
      </UDashboardNavbar>

      <!-- Toolbar Filter Periode -->
      <UDashboardToolbar>
        <template #left>
          <span class="-ms-1 px-2 flex items-center text-sm text-muted">
            {{ dashboard?.selectedPeriodName ?? 'Current Period' }}
          </span>

          <HomePeriodSelect v-model="period" />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <!-- Visualisasi Data & Statistik Usaha -->
      <HomeStats :dashboard="dashboard" :pending="pending" />
      <HomeChart :dashboard="dashboard" />
      <HomeSales :dashboard="dashboard" :pending="pending" />
    </template>
  </UDashboardPanel>
</template>
