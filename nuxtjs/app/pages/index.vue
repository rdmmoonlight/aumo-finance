<script setup lang="ts">
definePageMeta({
  layout: 'landing'
})

const api = useApi()

const connectionStatus = ref<'loading' | 'connected' | 'error'>('loading')
const statusMessage = ref('Memeriksa koneksi...')

const checkBackendConnection = async () => {
  connectionStatus.value = 'loading'
  statusMessage.value = 'Memeriksa koneksi...'

  try {
    const res = await api<string>('/', { method: 'GET' })
    connectionStatus.value = 'connected'
    statusMessage.value = `Backend: ${res}`
  } catch (err: any) {
    console.error('Error koneksi:', err)
    connectionStatus.value = 'error'
    statusMessage.value = err.message || 'Gagal terhubung'
  }
}

onMounted(() => {
  checkBackendConnection()
})
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Selamat Datang">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <!-- Tempatkan Badge tepat di samping Title agar muncul konsisten di Desktop & Mobile -->
        <template #title>
          <div class="flex items-center gap-3">
            <span class="font-semibold text-gray-900 dark:text-white">Selamat Datang</span>
            <UBadge
              :color="connectionStatus === 'connected' ? 'success' : connectionStatus === 'error' ? 'error' : 'warning'"
              variant="subtle"
              size="sm"
              class="inline-flex items-center gap-1.5 cursor-pointer select-none"
              @click="checkBackendConnection"
            >
              <UIcon
                :name="connectionStatus === 'connected' ? 'i-lucide-check-circle-2' : connectionStatus === 'error' ? 'i-lucide-alert-triangle' : 'i-lucide-loader-2'"
                :class="{ 'animate-spin': connectionStatus === 'loading' }"
              />
              {{ statusMessage }}
            </UBadge>
          </div>
        </template>

        <!-- Tombol Login & Register -->
        <template #right>
          <div class="flex items-center gap-2">
            <UButton
              to="/login"
              color="neutral"
              variant="ghost"
              icon="i-lucide-log-in"
            >
              Login
            </UButton>

            <UButton
              to="/register"
              color="primary"
              variant="solid"
              icon="i-lucide-user-plus"
            >
              Register
            </UButton>
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col items-center justify-center text-center py-16 px-4 space-y-6">
        <h1 class="max-w-3xl text-3xl font-bold tracking-tight">
          Kelola Bisnis Anda Lebih Efisien
        </h1>
        <p class="max-w-2xl text-lg text-muted">
          Platform terpadu untuk memantau performa, menganalisis data penjualan,
          dan mengelola pelanggan Anda dalam satu dashboard intuitif.
        </p>
        <div class="flex items-center justify-center gap-4 pt-4">
          <UButton
            to="/register"
            size="lg"
            color="primary"
            icon="i-lucide-rocket"
          >
            Mulai Sekarang
          </UButton>
          <UButton
            to="/login"
            size="lg"
            color="neutral"
            variant="outline"
            icon="i-lucide-log-in"
          >
            Masuk ke Akun
          </UButton>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>