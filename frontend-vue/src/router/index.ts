import AuthenticatedLayout from '@/components/AuthenticatedLayout.vue';
import { authKeys, getProfileApi } from '@/features/auth/api/auth.api';
import { queryClient } from '@/lib/query-client';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // --- / Landing (publik) ---
    {
      path: '/',
      name: 'landing',
      component: () => import('../views/LandingView.vue'),
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
    {
      path: '/auth/login',
      name: 'auth-login',
      component: () => import('../views/AuthLoginView.vue'),
    },
    {
      path: '/auth/register',
      name: 'auth-register',
      component: () => import('../views/AuthRegisterView.vue'),
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
          path: '/dashboard',
          name: 'dashboard',
          component: () => import('../views/DashboardView.vue'),
        },
        {
          path: '/about',
          name: 'about',
          component: () => import('../views/AboutView.vue'),
        },

        // Fitur inti
        {
          path: '/periods',
          name: 'periods',
          component: () => import('../views/PeriodsView.vue'),
        },
        {
          path: '/chart-of-accounts',
          name: 'chart-of-accounts',
          component: () => import('../views/ChartOfAccountsView.vue'),
        },
        {
          path: '/journal-entry',
          name: 'journal-entry',
          component: () => import('../views/JournalEntryView.vue'),
        },
        {
          path: '/tools',
          name: 'tools',
          component: () => import('../views/ToolsView.vue'),
        },
        {
          path: '/settings',
          name: 'settings',
          component: () => import('../views/SettingsView.vue'),
        },

        // Laporan - Indeks
        {
          path: '/reports',
          name: 'reports',
          component: () => import('../views/reports/ReportsIndexView.vue'),
        },

        // Laporan - Jurnal
        {
          path: '/reports/journals',
          name: 'reports-journals',
          component: () => import('../views/reports/JournalsView.vue'),
        },
        {
          path: '/reports/journals/general',
          name: 'reports-journals-general',
          component: () => import('../views/reports/JournalsGeneralView.vue'),
        },
        {
          path: '/reports/journals/adjusting',
          name: 'reports-journals-adjusting',
          component: () => import('../views/reports/JournalsAdjustingView.vue'),
        },
        {
          path: '/reports/journals/closing',
          name: 'reports-journals-closing',
          component: () => import('../views/reports/JournalsClosingView.vue'),
        },

        // Laporan - Buku besar
        {
          path: '/reports/general-ledgers',
          name: 'reports-general-ledgers',
          component: () => import('../views/reports/GeneralLedgersView.vue'),
        },
        {
          path: '/reports/general-ledgers/permanent',
          name: 'reports-general-ledgers-permanent',
          component: () => import('../views/reports/GeneralLedgersPermanentView.vue'),
        },
        {
          path: '/reports/general-ledgers/temporary',
          name: 'reports-general-ledgers-temporary',
          component: () => import('../views/reports/GeneralLedgersTemporaryView.vue'),
        },

        // Laporan - Neraca saldo
        {
          path: '/reports/trial-balances',
          name: 'reports-trial-balances',
          component: () => import('../views/reports/TrialBalancesView.vue'),
        },
        {
          path: '/reports/trial-balances/unadjusted',
          name: 'reports-trial-balances-unadjusted',
          component: () => import('../views/reports/TrialBalancesUnadjustedView.vue'),
        },
        {
          path: '/reports/trial-balances/adjusted',
          name: 'reports-trial-balances-adjusted',
          component: () => import('../views/reports/TrialBalancesAdjustedView.vue'),
        },
        {
          path: '/reports/trial-balances/post-closing',
          name: 'reports-trial-balances-post-closing',
          component: () => import('../views/reports/TrialBalancesPostClosingView.vue'),
        },

        // Laporan - Neraca lajur
        {
          path: '/reports/worksheet',
          name: 'reports-worksheet',
          component: () => import('../views/reports/WorksheetView.vue'),
        },

        // Laporan - Laporan keuangan
        {
          path: '/reports/financial-statements',
          name: 'reports-financial-statements',
          component: () => import('../views/reports/FinancialStatementsView.vue'),
        },
        {
          path: '/reports/financial-statements/income-statement',
          name: 'reports-financial-statements-income-statement',
          component: () => import('../views/reports/IncomeStatementView.vue'),
        },
        {
          path: '/reports/financial-statements/retained-earnings',
          name: 'reports-financial-statements-retained-earnings',
          component: () => import('../views/reports/RetainedEarningsView.vue'),
        },
        {
          path: '/reports/financial-statements/statement-of-cash-flow',
          name: 'reports-financial-statements-statement-of-cash-flow',
          component: () => import('../views/reports/StatementOfCashFlowView.vue'),
        },
        {
          path: '/reports/financial-statements/statement-of-financial-position',
          name: 'reports-financial-statements-statement-of-financial-position',
          component: () => import('../views/reports/StatementOfFinancialPositionView.vue'),
        },
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
  const needsAuth = to.matched.some((r) => r.meta.requiresAuth);
  if (!needsAuth) return true;

  try {
    // Pakai cache yang sama dengan useGetProfileQuery()
    // Kalau masih fresh, tidak fetch ulang ke /auth/me
    const profile = await queryClient.fetchQuery({
      queryKey: authKeys.profile,
      queryFn: getProfileApi,
      staleTime: 5 * 60 * 1000,
      retry: false,
    });

    if (!profile) {
      return { path: '/auth/login', query: { redirect: to.fullPath } };
    }
    return true;
  } catch (e: any) {
    const status = e?.response?.status ?? e?.status;

    if (status === 401) {
      queryClient.removeQueries({ queryKey: authKeys.all });
    }

    return { path: '/auth/login', query: { redirect: to.fullPath } };
  }
});

export default router