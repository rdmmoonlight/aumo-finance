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

    // --- Path Redirect ---
    { path: '/reports', redirect: '/reports-page' },
    { path: '/reports/journals', redirect: '/reports/journals/general' },
    { path: '/reports/general-ledgers', redirect: '/reports/general-ledgers/permanent' },
    { path: '/reports/trial-balances', redirect: '/reports/trial-balances/unadjusted' },
    { path: '/reports/financial-statements', redirect: '/reports/financial-statements/income-statement' },

    // --- Reports Page ---
    {
      path: '/reports-page',
      name: 'reports-page',
      component: () => import('@/features/reports/reports-page/ReportsPage.vue'),
      meta: { requiresAuth: true },
    },
   
    // --- Journals & Ledgers (Step 01 - 03) ---
    {
      path: '/reports/journals/general',
      name: 'general-journal',
      component: () =>
        import('@/features/reports/journals/general/GeneralJournalPage.vue'),
      meta: { requiresAuth: true },
    },

    {
      path: '/reports/general-ledgers/permanent',
      name: 'general-ledger-permanent',
      component: () =>
        import('@/features/reports/general-ledgers/permanent/PermanentGeneralLedgerPage.vue'),
      meta: { requiresAuth: true },
    },

    {
      path: '/reports/general-ledgers/temporary',
      name: 'general-ledger-temporary',
      component: () =>
        import('@/features/reports/general-ledgers/temporary/TemporaryGeneralLedgerPage.vue'),
      meta: { requiresAuth: true },
    },

    // --- Trial Balance Cycle (Step 04 - 07) ---
    {
      path: '/reports/trial-balances/unadjusted',
      name: 'unadjusted-trial-balance',
      component: () =>
        import('@/features/reports/trial-balances/unadjusted/UnadjustedTrialBalancePage.vue'),
      meta: { requiresAuth: true },
    },

    {
      path: '/reports/worksheet',
      name: 'worksheet',
      component: () =>
        import('@/features/reports/worksheet/WorksheetPage.vue'),
      meta: { requiresAuth: true },
    },

    {
      path: '/reports/journals/adjusting',
      name: 'adjusting-journal',
      component: () =>
        import('@/features/reports/journals/adjusting/AdjustingJournalPage.vue'),
      meta: { requiresAuth: true },
    },

    {
      path: '/reports/trial-balances/adjusted',
      name: 'adjusted-trial-balance',
      component: () =>
        import('@/features/reports/trial-balances/adjusted/AdjustedTrialBalancePage.vue'),
      meta: { requiresAuth: true },
    },

    // --- Financial Statements (Step 08 - 11) ---
    {
      path: '/reports/financial-statements/income-statement',
      name: 'income-statement',
      component: () =>
        import('@/features/reports/financial-statements/income-statement/IncomeStatementPage.vue'),
      meta: { requiresAuth: true },
    },

    {
      path: '/reports/financial-statements/retained-earnings',
      name: 'retained-earnings',
      component: () =>
        import('@/features/reports/financial-statements/retained-earnings/RetainedEarningsPage.vue'),
      meta: { requiresAuth: true },
    },

    {
      path: '/reports/financial-statements/statement-of-financial-position',
      name: 'statement-of-financial-position',
      component: () =>
        import('@/features/reports/financial-statements/financial-position/StatementOfFinancialPositionPage.vue'),
      meta: { requiresAuth: true },
    },

    {
      path: '/reports/financial-statements/statement-of-cash-flow',
      name: 'statement-of-cash-flow',
      component: () =>
        import('@/features/reports/financial-statements/cash-flow/StatementOfCashFlowPage.vue'),
      meta: { requiresAuth: true },
    },

    // --- Closing Cycle (Step 12 - 13) ---
    {
      path: '/reports/journals/closing',
      name: 'closing-journal',
      component: () =>
        import('@/features/reports/journals/closing/ClosingJournalPage.vue'),
      meta: { requiresAuth: true },
    },

    {
      path: '/reports/trial-balances/post-closing',
      name: 'post-closing-trial-balance',
      component: () =>
        import('@/features/reports/trial-balances/post-closing/PostClosingTrialBalancePage.vue'),
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

    // --- Catch-all 404 ---
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
