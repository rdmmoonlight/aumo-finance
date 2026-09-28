<!-- components/AppTopbar.vue -->
<script setup lang="ts">
// Anda bisa menambahkan props jika ingin judul topbar dinamis
defineProps<{
  title?: string
}>()
</script>

<template>
  <UDashboardNavbar :title="title">
    <template #leading>
      <!-- Tombol toggle/collapse sidebar -->
      <UDashboardSidebarCollapse />
    </template>

    <template #right>
      <!-- Slot untuk tombol/menu di sebelah kanan topbar (misal: Notification, User Profile) -->
      <slot name="right" />
    </template>
  </UDashboardNavbar>
</template>
