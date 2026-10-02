// Composables Auth untuk Hono Backend Render

export interface AuthUser {
  id: string
  userId?: string
  email: string
  username: string
  fullName?: string
  roles?: string[]
}

export interface MeResponse {
  authenticated: boolean
  user?: {
    id: string
    username: string
    email: string
  }
  message?: string
}

export interface LoginResponse {
  message: string
  userId?: string
}

export interface LoginPayload {
  email?: string
  username?: string
  password: string
  rememberMe?: boolean
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export interface RegisterResponse {
  message: string
  user?: any
}

export function useAuthUser() {
  return useState<AuthUser | null>('auth-user', () => null)
}

export function useAuthChecked() {
  return useState<boolean>('auth-checked', () => false)
}

export async function fetchAuthUser() {
  const user = useAuthUser()
  const checked = useAuthChecked()
  const api = useApi()

  try {
    const response = await api<MeResponse>('/api/auth/me', {
      method: 'GET'
    })

    if (response && response.authenticated && response.user) {
      user.value = {
        id: response.user.id,
        userId: response.user.id,
        email: response.user.email,
        username: response.user.username,
        fullName: response.user.username ? response.user.username.split('@')[0] : 'User',
        roles: []
      }
    } else {
      user.value = null
    }
  } catch {
    user.value = null
  } finally {
    checked.value = true
  }

  return user.value
}

export async function login(payload: LoginPayload) {
  const user = useAuthUser()
  const checked = useAuthChecked()
  const api = useApi()

  // ⚠️ DUKUNGAN GANDA: Baca dari payload.username ATAU payload.email
  const inputIdentifier = payload.username || payload.email || ''

  const response = await api<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: {
      username: inputIdentifier, // Wajib terisi string non-empty
      password: payload.password,
      rememberMe: payload.rememberMe ?? false
    }
  })

  if (response && response.userId) {
    user.value = {
      id: response.userId,
      userId: response.userId,
      email: inputIdentifier,
      username: inputIdentifier,
      fullName: inputIdentifier.split('@')[0],
      roles: []
    }
    checked.value = true

    // Refresh detail profil user secara asynchronous dari Hono
    fetchAuthUser().catch(() => {})
  }

  return response
}

export async function register(payload: RegisterPayload) {
  const api = useApi()

  const response = await api<RegisterResponse>('/api/auth/register', {
    method: 'POST',
    body: payload
  })

  return response
}

export async function logout() {
  const api = useApi()

  try {
    await api('/api/auth/logout', { method: 'POST' })
  } catch {
    // Abaikan error jaringan saat logout
  } finally {
    useAuthUser().value = null
    useAuthChecked().value = true

    await navigateTo('/')
  }
}

// Main Composable Hook Export
export function useAuth() {
  const user = useAuthUser()
  const checked = useAuthChecked()

  return {
    user,
    checked,
    fetchAuthUser,
    login,
    register,
    logout
  }
}
