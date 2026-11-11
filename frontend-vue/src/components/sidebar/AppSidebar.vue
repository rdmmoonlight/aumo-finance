<template>
  <!-- WRAPPER: Flex item (hidden md:flex shrink-0) dengan dinamis style width -->
  <div data-slot="sidebar-wrapper" :data-state="sidebarStore.isCollapsed ? 'collapsed' : 'expanded'"
    data-collapsible="icon" data-variant="sidebar" data-side="left" :style="{
      '--sidebar-width': sidebarStore.isCollapsed ? '3.5rem' : '285px',
      '--sidebar-width-icon': '3.5rem',
    }" class="group peer hidden md:flex shrink-0 text-sidebar-foreground transition-[width] duration-200 ease-linear">
    <!-- SIDEBAR-GAP: Penahan alur Flexbox (Diturunkan 2cm di bawah Topbar) -->
    <div data-slot="sidebar-gap"
      class="relative h-[calc(100vh-var(--topbar-height,104px))] w-[var(--sidebar-width)] bg-transparent transition-[width] duration-200 ease-linear" />

    <!-- SIDEBAR-CONTAINER: Position Fixed (top: calc(3.5rem + 2cm)) -->
    <div data-slot="sidebar-container"
      class="fixed top-[var(--topbar-height,104px)] bottom-0 z-10 hidden h-[calc(100vh-var(--topbar-height,104px))] w-[var(--sidebar-width)] transition-[width,left,right] duration-200 ease-linear md:flex left-0 border-r border-sidebar-border bg-sidebar">
      <!-- SIDEBAR-INNER -->
      <div data-slot="sidebar-inner" class="flex h-full w-full flex-col overflow-hidden">
        <!-- Content Navigation -->
        <div class="p-2 flex-1 overflow-y-auto">
          <div>
            <!-- Header Navigation & Button Toggle -->
            <div v-if="!sidebarStore.isCollapsed" class="flex items-center justify-between px-2 mb-2 h-7">
              <span class="uppercase tracking-widest text-muted-foreground text-xs font-semibold">
                Navigation
              </span>
              <Button variant="ghost" size="icon" class="h-7 w-7 shrink-0" @click="sidebarStore.toggleSidebar">
                <PanelLeftClose class="h-4 w-4" />
              </Button>
            </div>

            <!-- Button Toggle saat Collapsed -->
            <div v-else class="flex justify-center mb-2">
              <Button variant="ghost" size="icon" class="h-7 w-7 shrink-0" @click="sidebarStore.toggleSidebar">
                <PanelLeft class="h-4 w-4" />
              </Button>
            </div>

            <ul class="flex flex-col gap-1">
              <li v-for="item in navigation" :key="item.title">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <RouterLink :to="item.url" :class="[
                      'flex items-center gap-3 text-sm h-9 font-normal px-2.5 rounded-md transition-colors min-w-0',
                      isActive(item.url)
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                        : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      sidebarStore.isCollapsed ? 'justify-center px-0' : '',
                    ]">
                      <component :is="item.icon" :class="ICON_CLASS" />
                      <span v-if="!sidebarStore.isCollapsed" class="truncate">
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

        <!-- Footer: Dropdown Pengguna -->
        <div class="border-t shrink-0 p-2">
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <div>
                <Tooltip v-if="sidebarStore.isCollapsed">
                  <TooltipTrigger as-child>
                    <button class="h-10 w-full flex items-center justify-center rounded-md hover:bg-accent">
                      <Avatar class="h-7 w-7 shrink-0">
                        <AvatarFallback class="bg-muted text-xs">
                          <template v-if="profileEmail">
                            {{ profileEmail.slice(0, 2).toUpperCase() }}
                          </template>
                          <User v-else class="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {{ profileEmail || 'Account' }}
                  </TooltipContent>
                </Tooltip>

                <button v-else
                  class="h-10 w-full flex items-center justify-between px-2 rounded-md hover:bg-accent text-left min-w-0">
                  <div class="flex min-w-0 items-center gap-2.5">
                    <Avatar class="h-7 w-7 shrink-0">
                      <AvatarFallback class="bg-muted text-xs">
                        <template v-if="profileEmail">
                          {{ profileEmail.slice(0, 2).toUpperCase() }}
                        </template>
                        <User v-else class="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div class="flex min-w-0 flex-col truncate">
                      <span class="truncate text-sm font-medium leading-tight">
                        {{ !isMounted || isUserLoading ? 'Memuat...' : profileEmail || 'Guest' }}
                      </span>
                      <span class="truncate text-xs text-muted-foreground">
                        {{
                          !isMounted || isUserLoading ? '...' : profileEmail || 'Tidak ada email'
                        }}
                      </span>
                    </div>
                  </div>
                  <ChevronsUpDown class="h-4 w-4 shrink-0 text-muted-foreground ml-1" />
                </button>
              </div>
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
        </div>

        <!-- Rail -->
        <button data-slot="sidebar-rail" aria-label="Toggle Sidebar" title="Toggle Sidebar"
          class="absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[1px] hover:after:bg-sidebar-border -right-4 sm:flex"
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
    queryClient.clear()
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
