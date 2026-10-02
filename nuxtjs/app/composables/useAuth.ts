// Composables Auth untuk Hono Backend Render

export interface AuthUser {
  userId: string
  email: string
  userName: string
  fullName: string
  roles: string[]
}

export interface MeResponse {
  authenticated: boolean
  user?: AuthUser
  message?: string
}

export interface LoginResponse {
  message: string
  userId?: string
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
    // Dipanggil ke Hono /api/auth/me
    const response = await api<MeResponse>('/auth/me', {
      method: 'GET'
    })

    if (response && response.authenticated && response.user) {
      user.value = response.user
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

export async function login(payload: {
  email: string
  password: string
  rememberMe?: boolean
}) {
  const user = useAuthUser()
  const checked = useAuthChecked()
  const api = useApi()

  // Kirim payload sesuai kontrak Hono
  const response = await api<LoginResponse>('/auth/login', {
    method: 'POST',
    body: {
      username: payload.email, // 👈 Hono membaca 'username'
      password: payload.password,
      rememberMe: payload.rememberMe ?? false
    }
  })

  if (response && response.userId) {
    user.value = {
      userId: response.userId,
      email: payload.email,
      userName: payload.email,
      fullName: payload.email.split('@')[0],
      roles: []
    }
    checked.value = true

    // Refresh detail profil user dari backend
    fetchAuthUser().catch(() => {})
  }

  return response
}

export async function register(payload: RegisterPayload) {
  const api = useApi()

  const response = await api<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: payload
  })

  return response
}

export async function logout() {
  const api = useApi()

  try {
    await api('/auth/logout', { method: 'POST' })
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
