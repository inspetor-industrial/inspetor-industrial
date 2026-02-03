import type {
  Company,
  UserResponsibility,
  UserRole,
} from '@inspetor/generated/prisma/client'

export interface AuthUser {
  id: string
  email: string
  name: string | null
  username: string | null
  role: UserRole
  responsibility: UserResponsibility | null
  companyId: string | null
  image: string | null
  company?: Company | null
}

export interface Session {
  user: AuthUser
  expiresAt: Date
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
  update: () => Promise<void>
}

export interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
}
