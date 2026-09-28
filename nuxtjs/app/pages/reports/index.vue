<!-- pages/reports/index.vue -->
<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

// Fetch Real Data dari API Summary
const { data: summary, pending: isLoadingSummary, refresh } = await useFetch('/api/v1/reports/summary')

// Format angka ribuan (e.g. 1.284)
const formatInt = (num?: number) => {
  return new Intl.NumberFormat('id-ID').format(num || 0)
}

// Compute Quick Stats secara DYNAMIC dari API Response
const summaryStats = computed(() => [
  {
    title: 'Total Transaksi Jurnal',
    value: formatInt(summary.value?.totalJournal),
    subtext: 'Transaksi Terdaftar',
    icon: 'i-lucide-notebook-tabs',
    color: 'text-blue-500'
  },
  {
    title: 'Total Akun Aktif',
    value: formatInt(summary.value?.activeCoa),
    subtext: 'Akun COA Aktif',
    icon: 'i-lucide-book-open',
    color: 'text-emerald-500'
  },
  {
    title: 'Periode Berjalan',
    value: summary.value?.activePeriodName || '-',
    subtext: summary.value?.isPeriodOpen ? 'Status: Terbuka' : 'Status: Ditutup / Belum Set',
    icon: 'i-lucide-calendar-range',
    color: 'text-amber-500'
  }
])

// Navigation items untuk laporan
const reportCategories = ref([
  {
    category: 'Laporan Akuntansi Utama',
    description: 'Pencatatan harian, buku besar, dan pencocokan saldo akun.',
    items: [
      {
        title: 'General Journal Report',
        description: 'Daftar rinci seluruh jurnal umum pencatatan debit & kredit harian.',
        to: '/reports/general-journal',
        icon: 'i-lucide-notebook-tabs',
        badge: 'Utama'
      },
      {
        title: 'General Ledger (Buku Besar)',
        description: 'Rincian pergerakan saldo dan mutasi untuk setiap akun COA.',
        to: '/reports/general-ledger',
        icon: 'i-lucide-book-marked',
        badge: 'Segera'
      },
      {
        title: 'Trial Balance (Neraca Saldo)',
        description: 'Ringkasan total debit dan kredit dari seluruh akun COA.',
        to: '/reports/trial-balance',
        icon: 'i-lucide-scale',
        badge: 'Segera'
      }
    ]
  },
  {
    category: 'Laporan Keuangan Eksekutif',
    description: 'Analisis laba rugi, posisi keuangan, dan arus kas usaha.',
    items: [
      {
        title: 'Income Statement (Laba Rugi)',
        description: 'Ringkasan pendapatan, beban, dan profit bersih perusahaan.',
        to: '/reports/income-statement',
        icon: 'i-lucide-trending-up',
        badge: 'Rencana'
      },
      {
        title: 'Balance Sheet (Neraca Keuangan)',
        description: 'Gambaran Aset, Liabilitas (Hutang), dan Ekuitas (Modal).',
        to: '/reports/balance-sheet',
        icon: 'i-lucide-landmark',
        badge: 'Rencana'
      }
    ]
  }
])
</script>

<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <!-- Header Landing Page -->
      <UDashboardNavbar title="Financial Reports" badge="Pusat Laporan">
        <template #right>
          <UButton
            icon="i-lucide-refresh-cw"
            color="neutral"
            variant="outline"
            size="xs"
            :loading="isLoadingSummary"
            @click="() => refresh()"
          >
            Refresh Data
          </UButton>
        </template>
      </UDashboardNavbar>

      <UDashboardPanelContent class="space-y-8 p-6">
        <!-- Banner Intro -->
        <div class="rounded-xl bg-gradient-to-r from-blue-600/10 via-indigo-500/10 to-purple-500/10 p-6 border border-blue-500/20">
          <div class="flex items-start justify-between">
            <div class="space-y-2">
              <h2 class="text-xl font-bold tracking-tight">Pusat Laporan & Analytics Keuangan</h2>
              <p class="text-sm text-neutral-500 dark:text-neutral-400 max-w-2xl">
                Akses seluruh laporan akuntansi, audit pencatatan jurnal umum, hingga analisis neraca keuangan secara terpusat dan konsisten.
              </p>
            </div>
            <UIcon name="i-lucide-file-pie-chart" class="w-12 h-12 text-blue-500 hidden sm:block opacity-80" />
          </div>
        </div>

        <!-- Quick Summary Cards (Real Data) -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <UCard v-for="(stat, idx) in summaryStats" :key="idx" class="relative overflow-hidden">
            <div class="flex items-center justify-between">
              <div class="space-y-1">
                <p class="text-xs font-medium text-neutral-500 dark:text-neutral-400">{{ stat.title }}</p>
                
                <!-- Skeleton Loader saat pending -->
                <USkeleton v-if="isLoadingSummary" class="h-8 w-24 my-1" />
                <p v-else class="text-2xl font-bold tracking-tight">{{ stat.value }}</p>
                
                <span class="text-xs text-neutral-500 font-medium block">{{ stat.subtext }}</span>
              </div>
              <div class="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                <UIcon :name="stat.icon" class="w-6 h-6" :class="stat.color" />
              </div>
            </div>
          </UCard>
        </div>

        <!-- Section List Kategori Laporan -->
        <div v-for="(group, gIdx) in reportCategories" :key="gIdx" class="space-y-4">
          <div>
            <h3 class="text-lg font-semibold text-neutral-800 dark:text-neutral-100">{{ group.category }}</h3>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">{{ group.description }}</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <NuxtLink
              v-for="(item, iIdx) in group.items"
              :key="iIdx"
              :to="item.to"
              class="group block"
            >
              <UCard
                class="h-full transition-all duration-200 hover:border-blue-500 hover:shadow-md cursor-pointer relative"
              >
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <div class="p-2.5 bg-blue-50 dark:bg-blue-950/50 rounded-lg text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <UIcon :name="item.icon" class="w-5 h-5" />
                    </div>
                    <UBadge
                      :color="item.badge === 'Utama' ? 'primary' : 'neutral'"
                      variant="subtle"
                      size="xs"
                    >
                      {{ item.badge }}
                    </UBadge>
                  </div>

                  <div>
                    <h4 class="font-semibold text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center gap-1">
                      {{ item.title }}
                      <UIcon name="i-lucide-arrow-right" class="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </h4>
                    <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                      {{ item.description }}
                    </p>
                  </div>
                </div>
              </UCard>
            </NuxtLink>
          </div>
        </div>
      </UDashboardPanelContent>
    </UDashboardPanel>
  </UDashboardPage>
</template>
