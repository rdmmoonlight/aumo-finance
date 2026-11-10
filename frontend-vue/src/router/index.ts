import { authKeys, getProfileApi } from '@/features/auth/api/auth.api'
import { queryClient } from '@/lib/query-client'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 1. Landing Page (Publik)
    {
      path: '/',
      name: 'landing',
      component: () => import('../features/landing/LandingPage.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/_test-auth',
      name: 'test-auth',
      component: () => import('../views/_TestAuth.vue'),
    },

    // 2. Auth Routes (Publik)
    { path: '/auth', redirect: '/auth/login' },
    {
      path: '/auth/login',
      name: 'login',
      component: () => import('../features/auth/AuthPage.vue'),
      props: { mode: 'login' },
      meta: { requiresAuth: false },
    },
    {
      path: '/auth/register',
      name: 'register',
      component: () => import('../features/auth/AuthPage.vue'),
      props: { mode: 'register' },
      meta: { requiresAuth: false },
    },

    // 4. Showcase (Publik)
    {
      path: '/_gallery',
      name: 'gallery-showcase',
      component: () => import('@/features/_gallery/GalleryPage.vue'),
    },

    // 5. Rute tidak dikenal -> landing
    { path: '/:pathMatch(.*)*', name: 'not-found', redirect: '/' },
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
  } catch (e: any) {
    const status = e?.response?.status ?? e?.status

    if (status === 401) {
      queryClient.removeQueries({ queryKey: authKeys.all })
    }

    return { path: '/auth/login', query: { redirect: to.fullPath } }
  }
})

export default router
