<template>
  <!-- Memverifikasi sesi... -->
  <div
    v-if="isAuthLoading"
    class="flex h-screen w-full items-center justify-center bg-background"
  >
    <p class="text-sm text-muted-foreground">Memverifikasi sesi...</p>
  </div>

  <!-- Sesi berakhir -->
  <div
    v-else-if="isAuthError"
    class="flex h-screen w-full items-center justify-center bg-background"
  >
    <p class="text-sm text-muted-foreground">
      Sesi berakhir, mengalihkan ke halaman login...
    </p>
  </div>

  <!-- Susunan: SidebarProvider -> AppSidebar + SidebarInset -->
  <TooltipProvider v-else :delay-duration="0">
    <SidebarProvider
      :style="{
        '--sidebar-width': '285px',
        '--sidebar-width-icon': '3.5rem',
      }"
    >
      <AppSidebar />
      <SidebarInset class="flex flex-1 flex-col min-w-0">
        <AppTopbar />
        <main class="relative flex-1 p-6">
          <!-- PeriodsLoadingOverlay -->
          <div
            v-if="isPeriodsLoading"
            class="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-"
          >
            <p class="text-sm text-muted-foreground">Memuat periode...</p>
          </div>
          <RouterView />
        </main>
        <AppFooter />
      </SidebarInset>
    </SidebarProvider>
  </TooltipProvider>
</template>

<script setup lang="ts">
import AppFooter from '@/components/AppFooter.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import AppTopbar from '@/components/AppTopbar.vue'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { onMounted, ref, watch } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { useLazyGetProfileQuery } from '../../features/auth/api/authApi'
import { useGetPeriodsOpenInfoQuery } from '../../features/periods/api/periodsApi'

// PeriodsLoadingOverlay
const { isLoading: isPeriodsLoading } = useGetPeriodsOpenInfoQuery()

// Guard sesi di dalam layout (verifikasi awal)
const { trigger: refetchProfile } = useLazyGetProfileQuery()
const router = useRouter()

const isAuthLoading = ref(true)
const isAuthError = ref(false)

const verifySessionAndLoadData = async () => {
  try {
    isAuthLoading.value = true
    const authResult = await refetchProfile()
    if (authResult.isError || !authResult.data) {
      isAuthError.value = true
      return
    }
    isAuthError.value = false
  } catch {
    isAuthError.value = true
  } finally {
    isAuthLoading.value = false
  }
}

onMounted(() => {
  verifySessionAndLoadData()
})

watch(isAuthError, (val) => {
  if (val) {
    const t = setTimeout(() => router.replace('/auth/login'), 800)
    return () => clearTimeout(t)
  }
})
</script>