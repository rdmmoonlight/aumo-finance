import type { Router } from 'vue-router'

export const HOME_PATH = '/home'

function isKnownPath(router: Router, path: string): boolean {
  return router.resolve(path).name !== 'not-found'
}

// Tujuan setelah login: ?redirect= (jika aman dan terdaftar) -> /home (jika ada) -> /
export function resolvePostLoginPath(router: Router, redirect?: unknown): string {
  const candidate = Array.isArray(redirect) ? redirect[0] : redirect
  if (
    typeof candidate === 'string' &&
    candidate.startsWith('/') &&
    !candidate.startsWith('//') &&
    isKnownPath(router, candidate)
  ) {
    return candidate
  }
  return isKnownPath(router, HOME_PATH) ? HOME_PATH : '/'
}

export function hasHomeRoute(router: Router): boolean {
  return isKnownPath(router, HOME_PATH)
}
