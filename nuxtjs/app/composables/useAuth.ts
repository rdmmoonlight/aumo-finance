// Thin wrapper around AuthController's /api/v1/auth/* routes (proxied
// by server/api/v1/[...].ts). Shared app-wide via useState so every
// component (UserMenu, the global auth middleware, the login page)
// sees the same session.

interface AuthUser {
  userId: string
  email: string
  userName: string
  fullName: string
  roles: string[]
}

interface MeResponse extends AuthUser {
  success: boolean
}

interface LoginResponse {
  success: boolean
  message: string
  userId: string
  fullName: string
}

export function useAuthUser() {
  return useState<AuthUser | null>('auth-user', () => null)
}

// Whether we've already asked the backend "who am I" at least once in
// this app load — avoids re-checking on every single navigation.
export function useAuthChecked() {
  return useState<boolean>('auth-checked', () => false)
}

export async function fetchAuthUser() {
  const user = useAuthUser()
  const checked = useAuthChecked()

  try {
    const response = await $fetch<MeResponse>('/api/v1/auth/me')
    user.value = response.success ? response : null
  } catch {
    // Not logged in (401) or backend unreachable — either way, no session.
    user.value = null
  } finally {
    checked.value = true
  }

  return user.value
}

export async function login(payload: { email: string, password: string, rememberMe?: boolean }) {
  const response = await $fetch<LoginResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: {
      email: payload.email,
      password: payload.password,
      rememberMe: payload.rememberMe ?? false,
      isMobileClient: false
    }
  })

  // Login only issues the session cookie; fetch /me to populate roles etc.
  await fetchAuthUser()

  return response
}

export async function logout() {
  try {
    await $fetch('/api/v1/auth/logout', { method: 'POST' })
  } finally {
    useAuthUser().value = null
    useAuthChecked().value = true
  }
}
