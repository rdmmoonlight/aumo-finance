<template>
  <header class="flex flex-col w-full border-b bg-background sticky top-0 z-10 shadow-sm">
    <!-- KELOMPOK 1: Bar Utama (Search & Notifications) -->
    <div class="flex h-16 items-center justify-between pl-3 pr-4 gap-4">
      <!-- Sisi Kiri: Search Bar -->
      <div class="flex items-center flex-1 max-w-md">
        <div class="relative w-full">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari transaksi, akun, atau laporan..."
            class="pl-9 bg-muted/40 text-sm focus-visible:bg-background"
          />
        </div>
      </div>

      <!-- Sisi Kanan: Notifikasi -->
      <div class="flex items-center">
        <Popover>
          <PopoverTrigger as-child>
            <Button
              variant="ghost"
              size="icon"
              class="relative text-muted-foreground hover:text-foreground"
              aria-label="Notifikasi"
            >
              <Bell class="h-5 w-5" />
              <span
                v-if="unreadCount > 0"
                class="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive animate-pulse"
              />
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
              <Button
                v-if="unreadCount > 0"
                variant="ghost"
                size="sm"
                :disabled="isMarkingAllRead"
                class="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                @click="handleMarkAllAsRead"
              >
                <Loader2 v-if="isMarkingAllRead" class="h-3 w-3 animate-spin" />
                <span v-else>Tandai dibaca</span>
              </Button>
            </div>

            <!-- List Notifikasi -->
            <div class="max-h-80 overflow-y-auto divide-y">
              <div
                v-if="isNotificationsLoading"
                class="p-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2"
              >
                <Loader2 class="h-4 w-4 animate-spin" /> Memuat notifikasi...
              </div>
              <div
                v-else-if="notificationsData.length === 0"
                class="p-4 text-center text-xs text-muted-foreground"
              >
                Tidak ada notifikasi saat ini.
              </div>
              <div
                v-for="item in notificationsData"
                v-else
                :key="item.id"
                :class="[
                  'p-3 text-xs cursor-pointer transition-colors hover:bg-muted/50 flex gap-3',
                  !item.isRead ? 'bg-muted/20 font-medium' : 'opacity-70',
                ]"
                @click="handleMarkAsRead(item.id, item.isRead)"
              >
                <div class="mt-0.5">
                  <AlertTriangle v-if="item.type === 'warning'" class="h-4 w-4 text-amber-500" />
                  <Info v-else class="h-4 w-4 text-blue-500" />
                </div>
                <div class="flex-1 space-y-1">
                  <div class="flex items-center justify-between">
                    <p class="font-semibold text-foreground text-sm">{{ item.title }}</p>
                    <span class="text-[10px] text-muted-foreground">
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

    <Separator />

    <!-- KELOMPOK 2: Bar Sekunder -->
    <div class="flex h-10 items-center justify-between pl-3 pr-4 bg-muted/20 text-xs">
      <!-- Dynamic Breadcrumbs -->
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/home" class="text-xs">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <template v-for="(segment, index) in pathSegments" :key="`${segment}-${index}`">
            <template v-if="!(segment === 'home' && index === 0)">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage
                  v-if="index === pathSegments.length - 1"
                  class="text-xs font-semibold"
                >
                  {{ formatSegment(segment) }}
                </BreadcrumbPage>
                <BreadcrumbLink v-else :href="getSegmentUrl(index)" class="text-xs">
                  {{ formatSegment(segment) }}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </template>
          </template>
        </BreadcrumbList>
      </Breadcrumb>

      <!-- Status Periode -->
      <div class="flex items-center gap-4 text-muted-foreground">
        <Badge
          v-if="selectedPeriod"
          variant="outline"
          :class="[
            'gap-1.5 font-medium text-xs',
            selectedPeriod.isClosed
              ? 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10'
              : 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
          ]"
        >
          <span
            :class="[
              'h-1.5 w-1.5 rounded-full',
              selectedPeriod.isClosed ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse',
            ]"
          />
          Periode: {{ selectedPeriod.periodName }}
          {{ selectedPeriod.isClosed ? ' (Closed)' : ' (Aktif)' }}
        </Badge>
        <Badge v-else variant="outline" class="gap-1.5 font-medium text-xs text-muted-foreground">
          <span class="h-1.5 w-1.5 rounded-full bg-slate-400" />
          {{ isPeriodLoading ? 'Memuat periode...' : 'Belum Ada Periode Dipilih' }}
        </Badge>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { type PeriodItem, useGetPeriodsQuery } from '#/features/periods/periods.api'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '@/features/settings/api/notifications.api'
import { AlertTriangle, Bell, Info, Loader2, Search } from 'lucide-vue-next'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

interface NotificationItem {
  id: string
  title: string
  message: string
  type?: 'warning' | 'info'
  isRead?: boolean
  createdAt?: string
}

const route = useRoute()
const pathname = computed(() => route.path)

// 1. Fetch Periods
const { data: rawPeriodsData, isLoading: isPeriodLoading } = useGetPeriodsQuery()

// 2. Fetch Notifikasi (menggunakan composable TanStack Query)
const { data: rawNotifications, isLoading: isNotificationsLoading } = useGetNotificationsQuery({
  limit: 20,
})

const notificationsData = computed<NotificationItem[]>(
  () => (rawNotifications.value as unknown as NotificationItem[]) || [],
)

// 3. Mutations Notifikasi
const { mutateAsync: markAllNotificationsRead, isPending: isMarkingAllRead } =
  useMarkAllNotificationsReadMutation()
const { mutateAsync: markNotificationRead } = useMarkNotificationReadMutation()

// Handlers Notifikasi
const handleMarkAllAsRead = async () => {
  try {
    await markAllNotificationsRead()
  } catch (error) {
    console.error('Gagal menandai semua dibaca:', error)
  }
}

const handleMarkAsRead = async (id: string, isRead?: boolean) => {
  if (isRead || !id) return
  try {
    await markNotificationRead({ id })
  } catch (error) {
    console.error('Gagal menandai dibaca:', error)
  }
}

const unreadCount = computed(() => notificationsData.value.filter((n) => !n.isRead).length)

// Parsing array periods
const periods = computed<PeriodItem[]>(() => {
  const raw = rawPeriodsData.value as unknown
  if (Array.isArray(raw)) return raw as PeriodItem[]
  const obj = raw as { items?: PeriodItem[]; periods?: PeriodItem[] } | null
  return obj?.items || obj?.periods || []
})

const selectedPeriod = computed(() => periods.value.find((p) => p.isSelected))
const pathSegments = computed(() => pathname.value.split('/').filter(Boolean))

// Helpers Breadcrumb & Waktu
const getSegmentUrl = (index: number) => `/${pathSegments.value.slice(0, index + 1).join('/')}`

const formatSegment = (segment: string) =>
  decodeURIComponent(segment)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())

const formatTime = (createdAt?: string) => {
  if (!createdAt) return ''
  return new Date(createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
