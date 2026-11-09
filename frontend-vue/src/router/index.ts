import AuthenticatedLayout from '@/components/AuthenticatedLayout.vue'
import { authKeys, getProfileApi } from '@/features/auth/api/auth.api'
import { queryClient } from '@/lib/query-client'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // --- / Landing (publik) ---
    {
      path: '/',
      name: 'landing',
      component: () => import('../features/landing/LandingPage.vue'),
    },
    {
      path: '/_test-auth',
      name: 'test-auth',
      component: () => import('../views/_TestAuth.vue'),
    },

    // --- Auth (publik) ---
    // /auth -> redirect ke /auth/login
    {
      path: '/auth',
      redirect: '/auth/login',
    },

    // --- _authenticated: route induk ---
    // Semua anak di bawah ini render di dalam AuthenticatedLayout
    // dan kena guard requiresAuth
    {
      path: '',
      component: AuthenticatedLayout,
      meta: { requiresAuth: true },
      children: [
        // Halaman utama
        {
          path: '/home',
          name: 'home',
          component: () => import('../views/HomeView.vue'),
        },

        {
          path: '/about',
          name: 'about',
          component: () => import('../views/AboutView.vue'),
        },

        // Fitur inti
      ],
    },

    // Di luar §6 - showcase lama, tetap publik
    {
      path: '/_gallery',
      name: 'gallery-showcase',
      component: () => import('@/features/_gallery/GalleryPage.vue'),
    },
  ],
})

// Guard sesi: hanya untuk route di bawah _authenticated
router.beforeEach(async (to) => {
  const needsAuth = to.matched.some((r) => r.meta.requiresAuth)
  if (!needsAuth) return true

  try {
    // Pakai cache yang sama dengan useGetProfileQuery()
    // Kalau masih fresh, tidak fetch ulang ke /auth/me
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
