// src/app/routes/index.ts
import { createRootRoute, createRoute } from '@tanstack/angular-router';

// 1. Root Route
export const rootRoute = createRootRoute();

// 2. Beranda Utama (/)
export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => import('../pages/index.page').then((m) => m.default),
});

// 3. Auth Layout Parent (Guest Guard dilakukan via beforeLoad)
export const authLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'auth-layout', // Tanpa path (pathless layout)
  beforeLoad: ({ location }) => {
    // Pengganti guestGuard
    guestGuard();
  },
  component: () => import('../pages/(auth)/(auth).page').then((m) => m.default),
});

export const loginRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/login',
  component: () => import('../pages/(auth)/login.page').then((m) => m.default),
});

export const registerRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/register',
  component: () => import('../pages/(auth)/register.page').then((m) => m.default),
});

// 4. App Layout Parent (Auth Guard)
export const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'app-layout', // Tanpa path (pathless layout)
  beforeLoad: ({ location }) => {
    // Pengganti authGuard
    authGuard();
  },
  component: () => import('../pages/(app).page').then((m) => m.default),
});

export const homeRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/home',
  component: () => import('../pages/(app)/home/index.page').then((m) => m.default),
});

// 5. Gabungkan Semua Rute ke dalam RouteTree
export const routeTree = rootRoute.addChildren([
  indexRoute,
  authLayoutRoute.addChildren([loginRoute, registerRoute]),
  appLayoutRoute.addChildren([homeRoute]),
]);
