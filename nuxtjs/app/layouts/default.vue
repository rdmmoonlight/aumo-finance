<!-- layouts/default.vue -->
<script setup lang="ts">
const route = useRoute()
const toast = useToast()

const open = ref(false)
const sidebarRef = ref()

const groups = computed(() => [{
  id: 'links',
  label: 'Go to',
  items: sidebarRef.value?.links?.flat() ?? []
}, {
  id: 'code',
  label: 'Code',
  items: [{
    id: 'source',
    label: 'View page source',
    icon: 'i-simple-icons-github',
    to: `https://github.com/nuxt-ui-templates/dashboard/blob/main/app/pages${route.path === '/' ? '/index' : route.path}.vue`,
    target: '_blank'
  }]
}])
</script>

<template>
  <UDashboardGroup unit="rem">
    <AppSidebar ref="sidebarRef" v-model:open="open" />

    <UDashboardSearch :groups="groups" />

    <UDashboardPanel grow>
      <!-- PANGGIL FILE TOPBAR DI SINI -->
      <AppTopbar />

      <UDashboardPanelContent>
        <slot />
      </UDashboardPanelContent>
    </UDashboardPanel>

    <NotificationsSlideover />
  </UDashboardGroup>
</template>
