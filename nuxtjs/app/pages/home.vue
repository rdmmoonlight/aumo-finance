<script setup lang="ts">
<<<<<<< Updated upstream
// Proteksi Halaman: Otomatis ditangani oleh global auth middleware
=======
// Proteksi Halaman: Diatur secara otomatis oleh middleware global (auth.global.ts)
>>>>>>> Stashed changes
definePageMeta({
  layout: 'default'
})

// Ambil data user yang sedang login
const user = useAuthUser()

// SEO Metadata
useSeoMeta({
  title: 'Home',
  description: 'Halaman utama aplikasi.'
})
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Home">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="py-12 px-6">
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
          Selamat datang, {{ user?.fullName || user?.userName || 'Pengguna' }}.
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Sistem siap digunakan. Silakan pilih menu di samping untuk melanjutkan pekerjaan Anda.
        </p>
      </div>
    </template>
  </UDashboardPanel>
</template>