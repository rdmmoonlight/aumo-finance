// Thin wrapper around AuthController's /api/v1/auth/* routes
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
export interface RegisterResponse {
  success: boolean
  message: string
  userId?: string
=======
export interface RegisterPayload {
  email: string
  password: string
  fullName?: string
  userName?: string
}

export interface RegisterResponse {
  success: boolean
  message: string
  user?: AuthUser
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
    // Ambil cookie header jika berjalan di server (SSR), kosongkan jika di browser client
    const headers = import.meta.server ? useRequestHeaders(['cookie']) as Record<string, string> : undefined
=======
    // Ambil header cookie hanya saat Server-Side Rendering (SSR)
    const headers: Record<string, string> = import.meta.server 
      ? (useRequestHeaders(['cookie']) as Record<string, string>) 
      : {}
>>>>>>> Stashed changes

    const response = await $fetch<MeResponse>('/api/v1/auth/me', { headers })
    
    if (response && response.success) {
      user.value = {
        userId: response.userId,
        email: response.email,
        userName: response.userName,
        fullName: response.fullName,
        roles: response.roles || []
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

<<<<<<< Updated upstream
  // Set state optimis dari respon login
=======
  // Set state user secara optimis dari respon login
>>>>>>> Stashed changes
  if (response && response.success) {
    user.value = {
      userId: response.userId,
      email: payload.email,
      userName: payload.email,
      fullName: response.fullName || '',
      roles: []
    }
    checked.value = true

<<<<<<< Updated upstream
    // Ambil profil lengkap (roles, dll) di background
=======
    // Ambil profil lengkap (roles, detail data) di background
>>>>>>> Stashed changes
    fetchAuthUser().catch(() => {})
  }

  return response
}

<<<<<<< Updated upstream
export async function register(payload: {
  fullName: string
  email: string
  password: string
  userName?: string
}) {
  const response = await $fetch<RegisterResponse>('/api/v1/auth/register', {
=======
export async function register(payload: RegisterPayload) {
  const response = await $fetch<RegisterResponse>('/api/auth/register', {
>>>>>>> Stashed changes
    method: 'POST',
    body: payload
  })

<<<<<<< Updated upstream
  // Opsional: Langsung ambil status user jika pendaftaran otomatis melakukan login / set cookie
  if (response && response.success) {
    await fetchAuthUser().catch(() => {})
  }

=======
>>>>>>> Stashed changes
  return response
}

export async function logout() {
  try {
    await $fetch('/api/v1/auth/logout', { method: 'POST' })
  } catch {
    // Mengabaikan error network saat logout agar state lokal tetap dibersihkan
  } finally {
    useAuthUser().value = null
    useAuthChecked().value = true
    
    // Redirect ke landing page setelah logout
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