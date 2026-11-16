<template>
  <!-- Memverifikasi sesi... -->
  <div v-if="isAuthLoading" class="flex h-screen w-full items-center justify-center bg-background">
    <p class="text-sm text-muted-foreground">Memverifikasi sesi...</p>
  </div>

  <!-- Sesi berakhir -->
  <div
    v-else-if="isAuthError"
    class="flex h-screen w-full items-center justify-center bg-background"
  >
    <p class="text-sm text-muted-foreground">Sesi berakhir, mengalihkan ke halaman login...</p>
  </div>

  <!-- Layout Utama -->
  <TooltipProvider v-else :delay-duration="0">
    <!-- Menambahkan --topbar-height: 104px sebagai single source of truth -->
    <div
      class="flex min-h-svh flex-col bg-background w-full"
      :style="{ '--topbar-height': '104px' }"
    >
      <!-- Topbar Full Width di paling atas (Header Area) -->
      <AppTopbar class="sticky top-0 z-20 w-full border-b shrink-0 bg-background" />

      <!-- Area Bawah Topbar: Sidebar + Content -->
      <SidebarProvider
        :style="{
          '--sidebar-width': '285px',
          '--sidebar-width-icon': '3.5rem',
        }"
        class="flex flex-1 w-full min-h-0 relative"
      >
        <!-- Sidebar di bawah Topbar -->
        <AppSidebar />

        <!-- Area Utama / Content Inset -->
        <SidebarInset
          class="flex flex-1 flex-col min-w-0 w-full overflow-x-hidden transition-all duration-200 ease-linear"
        >
          <main class="relative flex-1 p-6">
            <!-- PeriodsLoadingOverlay -->
            <div
              v-if="isPeriodsPending"
              class="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm"
            >
              <p class="text-sm text-muted-foreground">Memuat data periode...</p>
            </div>

            <RouterView />
          </main>

          <AppFooter />
        </SidebarInset>
      </SidebarProvider>
    </div>
  </TooltipProvider>
</template>

<script setup lang="ts">
import AppTopbar from '#/components/topbar/AppTopbar.vue'
import { useGetPeriodsQuery } from '#/features/periods/periods.api'
import AppFooter from '@/components/AppFooter.vue'
import AppSidebar from '@/components/sidebar/AppSidebar.vue'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useGetProfileQuery } from '@/features/auth/auth.api'
import { watch } from 'vue'
import { RouterView, useRouter } from 'vue-router'

const router = useRouter()

// Menggunakan useGetPeriodsQuery & isPending agar overlay hanya muncul saat initial load
const { isPending: isPeriodsPending } = useGetPeriodsQuery()

// Fetching Profile secara otomatis saat komponen di-mount
const { isLoading: isAuthLoading, isError: isAuthError, data: profileData } = useGetProfileQuery()

// Pengalihan halaman jika terjadi error / sesi habis
watch(
  [isAuthError, isAuthLoading, profileData],
  ([isError, isLoading, data], _, onCleanup) => {
    if (isError || (!isLoading && !data)) {
      const t = setTimeout(() => {
        router.replace('/auth/login')
      }, 800)

      onCleanup(() => clearTimeout(t))
    }
  },
  { immediate: true },
)
</script>
