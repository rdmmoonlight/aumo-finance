import { authKeys, getProfileApi } from '@/features/auth/auth.api'
import { queryClient } from '@/lib/query-client'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('@/features/landing/LandingPage.vue'),
      meta: { requiresAuth: false },
    },

    { path: '/auth', name: 'auth', redirect: '/auth/login' },

    {
      path: '/auth/login',
      name: 'login',
      component: () => import('@/features/auth/LoginPage.vue'),
      props: { mode: 'login' },
      meta: { requiresAuth: false },
    },

    {
      path: '/auth/register',
      name: 'register',
      component: () => import('@/features/auth/RegisterPage.vue'),
      props: { mode: 'register' },
      meta: { requiresAuth: false },
    },

    {
      path: '/_gallery',
      name: 'gallery-showcase',
      component: () => import('@/features/_gallery/GalleryPage.vue'),
      meta: { requiresAuth: false },
    },

    { path: '/:pathMatch(.*)*', name: 'not-found', redirect: '/' },

    {
      path: '/home',
      name: 'home',
      component: () => import('@/features/home/HomePage.vue'),
      meta: { requiresAuth: true },
    },

    {
      path: '/periods',
      name: 'periods',
      component: () => import('@/features/periods/PeriodsPage.vue'),
      meta: { requiresAuth: true },
    },

    {
      path: '/chart-of-accounts',
      name: 'chart-of-accounts',
      component: () => import('@/features/chart-of-accounts/ChartOfAccountsPage.vue'),
      meta: { requiresAuth: true },
    },

    {
      path: '/journal-entry',
      name: 'journal-entry',
      component: () => import('@/features/journal-entry/JournalEntryPage.vue'),
      meta: { requiresAuth: true },
    },

    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/features/dashboard/DashboardPage.vue'),
      meta: { requiresAuth: true },
    },

    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/features/settings/SettingsPage.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// Navigation Guard
router.beforeEach(async (to) => {
  const needsAuth = to.matched.some((r) => r.meta.requiresAuth)
  if (!needsAuth) return true

  try {
    const profile = await queryClient.fetchQuery({
      queryKey: authKeys.profile,
      queryFn: ({ signal }) => getProfileApi(signal),
      staleTime: 5 * 60 * 1000,
      retry: false,
    })

    if (!profile) {
      return { path: '/auth/login', query: { redirect: to.fullPath } }
    }
    return true
  } catch (e: unknown) {
    const error = e as { response?: { status?: number }; status?: number } | null
    const status = error?.response?.status ?? error?.status

    if (status === 401) {
      queryClient.removeQueries({ queryKey: authKeys.all })
    }

    return { path: '/auth/login', query: { redirect: to.fullPath } }
  }
})

export default router
