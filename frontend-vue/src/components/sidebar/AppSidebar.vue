<template>
  <!-- WRAPPER -->
  <div data-slot="sidebar-wrapper" :data-state="sidebarStore.state" data-collapsible="icon" data-variant="sidebar"
    data-side="left" :style="{
      '--sidebar-width': '285px',
      '--sidebar-width-icon': '3.5rem',
    }" class="group peer hidden md:block text-sidebar-foreground">
    <!-- SIDEBAR-GAP -->
    <div data-slot="sidebar-gap"
      class="relative h-svh w-[--sidebar-width] bg-transparent transition-[width] duration-200 ease-linear group-data-[collapsible=offcanvas]:w-0 group-data-[side=right]:rotate-180 group-data-[collapsible=icon]:w-[--sidebar-width-icon]" />

    <!-- SIDEBAR-CONTAINER -->
    <div data-slot="sidebar-container"
      class="fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] duration-200 ease-linear md:flex left-0 group-data-[collapsible=offcanvas]:-left-(--sidebar-width) group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:left-auto group-data-[side=right]:right-0 group-data-[side=right]:border-l">
      <!-- SIDEBAR-INNER -->
      <div data-slot="sidebar-inner"
        class="bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow flex h-full w-full flex-col">
        <!-- Header -->
        <div :class="[
          'border-b shrink-0 flex items-center gap-2',
          sidebarStore.isCollapsed
            ? 'flex-col justify-center p-2.5 gap-3'
            : 'flex-row justify-between p-3.5',
        ]">
          <div v-if="sidebarStore.isCollapsed" class="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <img src="/favicon.ico" alt="Aumo" width="28" height="28" class="h-7 w-7 object-contain" />
          </div>
          <h2 v-else class="text-xl font-bold tracking-tight truncate">Aumo Finance</h2>

          <Button variant="ghost" size="icon" class="h-7 w-7 shrink-0" @click="sidebarStore.toggleSidebar">
            <PanelLeft v-if="sidebarStore.isCollapsed" class="h-4 w-4" />
            <PanelLeftClose v-else class="h-4 w-4" />
          </Button>
        </div>

        <!-- Content -->
        <div class="p-2.5 flex-1 overflow-y-auto">
          <div>
            <div
              class="uppercase tracking-widest text-muted-foreground mb-2 px-2 group-data-[collapsible=icon]:hidden text-xs">
              Navigation
            </div>
            <div>
              <ul class="flex flex-col gap-1">
                <li v-for="item in navigation" :key="item.title">
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <RouterLink :to="item.url" :class="[
                        'flex items-center gap-2.5 text-sm h-8 font-normal px-2 rounded-md transition-colors',
                        isActive(item.url)
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                          : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      ]">
                        <component :is="item.icon" :class="ICON_CLASS" />
                        <span class="truncate group-data-[collapsible=icon]:hidden">
                          {{ item.title }}
                        </span>
                      </RouterLink>
                    </TooltipTrigger>
                    <TooltipContent v-if="sidebarStore.isCollapsed" side="right" align="center">
                      {{ item.title }}
                    </TooltipContent>
                  </Tooltip>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Footer: Dropdown Pengguna -->
        <div :class="[
          'border-t shrink-0',
          sidebarStore.isCollapsed ? 'p-2 flex justify-center' : 'p-2.5',
        ]">
          <ul>
            <li>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <!-- Mode collapsed -->
                  <Tooltip v-if="sidebarStore.isCollapsed">
                    <TooltipTrigger as-child>
                      <button class="mx-auto flex size-9 items-center justify-center rounded-full p-0 hover:bg-accent">
                        <Avatar class="h-8 w-8">
                          <AvatarFallback class="bg-muted text-xs">
                            <template v-if="profileEmail">{{
                              profileEmail.slice(0, 2).toUpperCase()
                              }}</template>
                            <User v-else class="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {{ profileEmail || 'Account' }}
                    </TooltipContent>
                  </Tooltip>

                  <!-- Mode expanded -->
                  <button v-else
                    class="h-auto w-full flex items-center justify-between px-2 py-2.5 rounded-md hover:bg-accent text-left">
                    <div class="flex min-w-0 items-center gap-2.5">
                      <Avatar class="h-8 w-8 shrink-0">
                        <AvatarFallback class="bg-muted text-xs">
                          <template v-if="profileEmail">{{
                            profileEmail.slice(0, 2).toUpperCase()
                            }}</template>
                          <User v-else class="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div class="flex min-w-0 flex-col truncate">
                        <span class="truncate text-sm font-medium leading-tight">
                          {{
                            !isMounted || isUserLoading
                              ? 'Memuat...'
                              : profileEmail || 'Guest'
                          }}
                        </span>
                        <span class="truncate text-xs text-muted-foreground">
                          {{
                            !isMounted || isUserLoading ? '...' : profileEmail || 'Tidak ada email'
                          }}
                        </span>
                      </div>
                    </div>
                    <ChevronsUpDown class="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" :side="sidebarStore.isCollapsed ? 'right' : 'top'" :side-offset="8"
                  class="w-56">
                  <DropdownMenuItem as-child class="text-sm">
                    <RouterLink to="/settings">
                      <Settings class="mr-2 h-4 w-4" />
                      Settings
                    </RouterLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem class="text-sm text-destructive" @click="handleSignOut">
                    <LogOut class="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          </ul>
        </div>

        <!-- Rail -->
        <button data-slot="sidebar-rail" aria-label="Toggle Sidebar" title="Toggle Sidebar"
          class="absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w- hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex"
          @click="sidebarStore.toggleSidebar" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSidebarStore } from '#/components/sidebar/useSidebarStore'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useGetProfileQuery, useLogoutMutation } from '@/features/auth/auth.api'
import { queryClient } from '@/lib/query-client'
import {
  BookOpen,
  Calendar,
  ChevronsUpDown,
  FileBarChart,
  FileSpreadsheet,
  Home,
  LayoutDashboard,
  LogOut,
  PanelLeft,
  PanelLeftClose,
  Settings,
  User,
  Wrench,
} from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const ICON_CLASS = 'h-4 w-4 shrink-0'
const SIDEBAR_KEYBOARD_SHORTCUT = 'b'

// Store & Routing
const sidebarStore = useSidebarStore()
const route = useRoute()
const pathname = computed(() => route.path)

// Navigation Configuration
const navigation = [
  { title: 'Home', url: '/home', icon: Home },
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Periods', url: '/periods', icon: Calendar },
  { title: 'Chart of Accounts', url: '/chart-of-accounts', icon: BookOpen },
  { title: 'Journal Entry', url: '/journal-entry', icon: FileSpreadsheet },
  { title: 'Reports', url: '/reports', icon: FileBarChart },
  { title: 'Tools', url: '/tools', icon: Wrench },
  { title: 'Settings', url: '/settings', icon: Settings },
]

const isActive = (url: string) =>
  pathname.value === url || (url !== '/home' && pathname.value.startsWith(url + '/'))

// Data Fetching (TanStack Query)
const { data: user, isLoading: isUserLoading } = useGetProfileQuery()
const profileEmail = computed(() => {
  const profile = user.value
  return profile && 'email' in profile && typeof profile.email === 'string'
    ? profile.email
    : undefined
})
const { mutateAsync: logout } = useLogoutMutation()

const isMounted = ref(false)

const handleSignOut = async () => {
  try {
    await logout()
  } catch (e) {
    console.error('Logout error:', e)
  } finally {
    // 1. Reset seluruh query cache di TanStack Query (pengganti resetApiState RTK)
    queryClient.clear()

    // 2. Clear Cookie Session
    document.cookie = 'AumoFinance.Session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    window.location.replace('/')
  }
}

// Event Listeners
const onKeyDown = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === SIDEBAR_KEYBOARD_SHORTCUT) {
    e.preventDefault()
    sidebarStore.toggleSidebar()
  }
}

onMounted(() => {
  isMounted.value = true
  sidebarStore.initFromCookie()
  sidebarStore.checkIsMobile()

  window.addEventListener('resize', sidebarStore.checkIsMobile)
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('resize', sidebarStore.checkIsMobile)
  window.removeEventListener('keydown', onKeyDown)
})
</script>
