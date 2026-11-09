export interface User {
  id: string
  email: string
  name?: string
  avatarUrl?: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface LoginPayload {
  email: string
  code?: string
}

export interface RegisterPayload {
  email: string
  name?: string
}
