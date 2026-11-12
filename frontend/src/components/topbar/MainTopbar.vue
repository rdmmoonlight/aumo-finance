<template>
  <div class="flex h-16 items-center justify-between pl-3 pr-4 gap-8">
    <!-- Sisi Kiri: Teks Sambutan & Search Bar -->
    <div class="flex items-center gap-6 flex-1">
      <!-- Teks Sambutan -->
      <div class="hidden sm:flex flex-col justify-center shrink-0">
        <span class="text-sm font-semibold leading-tight text-foreground"> Welcome </span>
        <span class="text-xs leading-tight text-muted-foreground">
          Hati-hati Dan Tetap Waspada!
        </span>
      </div>

      <!-- Search Bar -->
      <div class="relative w-full max-w-md ml-6">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input :model-value="searchQuery" type="search" placeholder="Cari transaksi, akun, atau laporan..."
          class="pl-9 bg-muted/40 text-sm focus-visible:bg-background"
          @update:model-value="searchQuery = String($event ?? '')" />
      </div>
    </div>

    <!-- Sisi Kanan: Notifikasi -->
    <div class="flex items-center">
      <Popover>
        <PopoverTrigger as-child>
          <Button variant="ghost" size="icon" class="relative text-muted-foreground hover:text-foreground"
            aria-label="Notifikasi">
            <Bell class="h-5 w-5" />
            <span v-if="unreadCount > 0"
              class="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive animate-pulse" />
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-80 p-0 mr-4" align="end">
          <!-- Header Popover -->
          <div class="flex items-center justify-between p-4 border-b">
            <div class="flex items-center gap-2">
              <h4 class="font-semibold text-sm">Notifikasi</h4>
              <Badge v-if="unreadCount > 0" variant="secondary" class="text-xs px-1.5 py-0.5">
                {{ unreadCount }} baru
              </Badge>
            </div>
            <Button v-if="unreadCount > 0" variant="ghost" size="sm" :disabled="isMarkingAllRead"
              class="h-auto p-0 text-xs text-muted-foreground hover:text-foreground" @click="emit('mark-all-as-read')">
              <Loader2 v-if="isMarkingAllRead" class="h-3 w-3 animate-spin" />
              <span v-else>Tandai dibaca</span>
            </Button>
          </div>

          <!-- List Notifikasi -->
          <div class="max-h-80 overflow-y-auto divide-y">
            <div v-if="isNotificationsLoading"
              class="p-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 class="h-4 w-4 animate-spin" /> Memuat notifikasi...
            </div>
            <div v-else-if="notificationsData.length === 0" class="p-4 text-center text-xs text-muted-foreground">
              Tidak ada notifikasi saat ini.
            </div>
            <div v-for="item in notificationsData" v-else :key="item.id" :class="[
              'p-3 text-xs cursor-pointer transition-colors hover:bg-muted/50 flex gap-3',
              !item.isRead ? 'bg-muted/20 font-medium' : 'opacity-70',
            ]" @click="emit('mark-as-read', item.id)">
              <div class="mt-0.5">
                <AlertTriangle v-if="item.type === 'warning'" class="h-4 w-4 text-amber-500" />
                <Info v-else class="h-4 w-4 text-blue-500" />
              </div>
              <div class="flex-1 space-y-1">
                <div class="flex items-center justify-between">
                  <p class="font-semibold text-foreground text-sm">{{ item.title }}</p>
                  <span class="text- whitespace-nowrap text-muted-foreground">
                    {{ formatTime(item.createdAt) }}
                  </span>
                </div>
                <p class="text-muted-foreground leading-relaxed text-xs">
                  {{ item.message }}
                </p>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { AlertTriangle, Bell, Info, Loader2, Search } from 'lucide-vue-next'
import { computed } from 'vue'

export interface NotificationItem {
  id: string | number
  title: string
  message: string
  type: 'warning' | 'info' | string
  isRead: boolean
  createdAt: string | Date
}

const props = defineProps<{
  notificationsData: NotificationItem[]
  isNotificationsLoading?: boolean
  isMarkingAllRead?: boolean
}>()

const emit = defineEmits<{
  'mark-as-read': [id: NotificationItem['id']]
  'mark-all-as-read': []
}>()

const searchQuery = defineModel<string>('searchQuery', { default: '' })

const unreadCount = computed(() => props.notificationsData.filter((n) => !n.isRead).length)

// Ganti dengan formatTime lamamu kalau sudah ada
function formatTime(date: string | Date) {
  return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(
    new Date(date),
  )
}
</script>
