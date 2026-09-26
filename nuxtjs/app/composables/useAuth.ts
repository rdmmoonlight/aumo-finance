// Thin wrapper around AuthController's /api/v1/auth/* routes
export interface AuthUser {
  userId: string
  email: string
  userName: string
  fullName: string
  roles: string[]
}

export interface MeResponse extends AuthUser {
  success: boolean
}

export interface LoginResponse {
  success: boolean
  message: string
  userId: string
  fullName: string
}

export interface RegisterResponse {
  success: boolean
  message: string
  userId?: string
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

  try {
    // Ambil cookie header jika berjalan di server (SSR), kosongkan jika di browser client
    const headers = import.meta.server ? useRequestHeaders(['cookie']) as Record<string, string> : undefined

    const response = await $fetch<MeResponse>('/api/v1/auth/me', { headers })
    
    if (response && response.success) {
      user.value = response
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

export async function login(payload: { email: string; password: string; rememberMe?: boolean }) {
  const user = useAuthUser()
  const checked = useAuthChecked()

  const response = await $fetch<LoginResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: {
      email: payload.email,
      password: payload.password,
      rememberMe: payload.rememberMe ?? false,
      isMobileClient: false
    }
  })

  // Set state optimis dari respon login
  if (response && response.success) {
    user.value = {
      userId: response.userId,
      email: payload.email,
      userName: payload.email,
      fullName: response.fullName,
      roles: []
    }
    checked.value = true

    // Ambil profil lengkap (roles, dll) di background
    fetchAuthUser().catch(() => {})
  }

  return response
}

export async function register(payload: {
  fullName: string
  email: string
  password: string
  userName?: string
}) {
  const response = await $fetch<RegisterResponse>('/api/v1/auth/register', {
    method: 'POST',
    body: payload
  })

  // Opsional: Langsung ambil status user jika pendaftaran otomatis melakukan login / set cookie
  if (response && response.success) {
    await fetchAuthUser().catch(() => {})
  }

  return response
}

export async function logout() {
  try {
    await $fetch('/api/v1/auth/logout', { method: 'POST' })
  } finally {
    useAuthUser().value = null
    useAuthChecked().value = true
    
    // Redirect ke landing page publik setelah logout
    await navigateTo('/')
  }
}
