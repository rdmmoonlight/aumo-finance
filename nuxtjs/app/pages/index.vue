<script setup lang="ts">
// Logic halaman landing page jika diperlukan
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Selamat Datang" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <!-- Tombol Login & Register diarahkan langsung ke /login dan /register -->
        <template #right>
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
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col items-center justify-center text-center py-16 px-4 space-y-6">
        <h1 class="text-4xl font-bold tracking-tight sm:text-6xl text-highlighted">
          Kelola Bisnis Anda Lebih Efisien
        </h1>
        <p class="max-w-2xl text-lg text-muted">
          Platform terpadu untuk memantau performa, menganalisis data penjualan, dan mengelola pelanggan Anda dalam satu dashboard intuitif.
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