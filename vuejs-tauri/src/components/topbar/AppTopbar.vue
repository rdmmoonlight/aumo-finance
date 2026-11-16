<template>
  <header class="flex flex-col w-full border-b bg-background sticky top-0 z-10 shadow-sm">
    <MainTopBar
      v-model:search-query="searchQuery"
      :notifications-data="notificationsData"
      :is-notifications-loading="isNotificationsLoading"
      :is-marking-all-read="isMarkingAllRead"
      @mark-as-read="handleMarkAsRead"
      @mark-all-as-read="handleMarkAllAsRead"
    />

    <Separator />

    <SecondTopBar :selected-period="selectedPeriod" :is-period-loading="isPeriodLoading" />
  </header>
</template>

<script setup lang="ts">
import { Separator } from '@/components/ui/separator'
import { ref } from 'vue'
import MainTopBar, { type NotificationItem } from './MainTopbar.vue'
import SecondTopBar, { type SelectedPeriod } from './SecondTopbar.vue'

// === State MainTopBar ===
const searchQuery = ref('')
const notificationsData = ref<NotificationItem[]>([])
const isNotificationsLoading = ref(false)
const isMarkingAllRead = ref(false)

// === State SecondTopBar ===
const selectedPeriod = ref<SelectedPeriod | null>(null)
const isPeriodLoading = ref(false)

function handleMarkAsRead(id: NotificationItem['id']) {
  const item = notificationsData.value.find((n) => n.id === id)
  if (item) item.isRead = true
}

async function handleMarkAllAsRead() {
  isMarkingAllRead.value = true
  try {
    notificationsData.value = notificationsData.value.map((n) => ({ ...n, isRead: true }))
  } finally {
    isMarkingAllRead.value = false
  }
}
</script>
