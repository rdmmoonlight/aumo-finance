<script setup lang="ts">
// Proteksi Halaman: Hanya user yang sudah login yang bisa akses
definePageMeta({
  layout: 'default',
  middleware: ['auth']
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
        <h1 class="text-2xl font-semibold text-highlighted tracking-tight">
          Selamat datang, {{ user?.fullName || user?.userName || 'Pengguna' }}.
        </h1>
        <p class="text-sm text-muted mt-2">
          Sistem siap digunakan. Silakan pilih menu di samping untuk melanjutkan pekerjaan Anda.
        </p>
      </div>
    </template>
  </UDashboardPanel>
</template>
