<template>
  <!-- Memverifikasi sesi... -->
  <div v-if="isAuthLoading" class="flex h-screen w-full items-center justify-center bg-background">
    <p class="text-sm text-muted-foreground">Memverifikasi sesi...</p>
  </div>

  <!-- Sesi berakhir -->
  <div v-else-if="isAuthError" class="flex h-screen w-full items-center justify-center bg-background">
    <p class="text-sm text-muted-foreground">Sesi berakhir, mengalihkan ke halaman login...</p>
  </div>

  <!-- Susunan: SidebarProvider -> AppSidebar + SidebarInset -->
  <TooltipProvider v-else :delay-duration="0">
    <SidebarProvider :style="{
      '--sidebar-width': '285px',
      '--sidebar-width-icon': '3.5rem',
    }">
      <AppSidebar />
      <SidebarInset class="flex flex-1 flex-col min-w-0">
        <AppTopbar />
        <main class="relative flex-1 p-6">
          <!-- PeriodsLoadingOverlay -->
          <div v-if="isPeriodsPending"
            class="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <p class="text-sm text-muted-foreground">Memuat data periode...</p>
          </div>

          <RouterView />
        </main>
        <AppFooter />
      </SidebarInset>
    </SidebarProvider>
  </TooltipProvider>
</template>

<script setup lang="ts">
import { useGetPeriodsQuery } from '#/features/periods/periods.api'
import AppFooter from '@/components/AppFooter.vue'
import AppTopbar from '@/components/AppTopbar.vue'
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
