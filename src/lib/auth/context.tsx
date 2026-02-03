'use client'

import type {
  AuthContextValue,
  AuthState,
  AuthUser,
  LoginCredentials,
} from '@inspetor/types/auth'
import { useRouter } from 'next/navigation'
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: ReactNode
  initialUser?: AuthUser | null
}

export function AuthProvider({
  children,
  initialUser = null,
}: AuthProviderProps) {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({
    user: initialUser,
    isLoading: !initialUser,
    isAuthenticated: !!initialUser,
  })

  const fetchUser = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }))

      const response = await fetch('/api/auth/me')

      if (response.ok) {
        const data = await response.json()
        setState({
          user: data.user,
          isLoading: false,
          isAuthenticated: true,
        })
      } else {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    } catch {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
    }
  }, [])

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setState((prev) => ({ ...prev, isLoading: true }))

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        setState((prev) => ({ ...prev, isLoading: false }))
        const data = await response.json()
        throw new Error(data.error || 'Login failed')
      }

      const data = await response.json()
      setState({
        user: data.user,
        isLoading: false,
        isAuthenticated: true,
      })

      router.push('/dashboard')
      router.refresh()
    },
    [router],
  )

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }))

    await fetch('/api/auth/logout', {
      method: 'POST',
    })

    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    })

    router.push('/auth/sign-in')
    router.refresh()
  }, [router])

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        setState({
          user: data.user,
          isLoading: false,
          isAuthenticated: true,
        })
      } else {
        // If refresh fails, user needs to login again
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    } catch {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
    }
  }, [])

  const update = useCallback(async () => {
    await fetchUser()
  }, [fetchUser])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: state.user,
      isLoading: state.isLoading,
      isAuthenticated: state.isAuthenticated,
      login,
      logout,
      refresh,
      update,
    }),
    [state, login, logout, refresh, update],
  )

  // Fetch current user on mount if no initial user provided
  useEffect(() => {
    if (!initialUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchUser()
    }
  }, [fetchUser, initialUser])

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

/**
 * Hook to get the current session (for compatibility with existing code)
 * Returns an object similar to next-auth's useSession
 */
export function useSession() {
  const { user, isLoading, isAuthenticated } = useAuth()

  return {
    data: user
      ? {
          user: {
            ...user,
            // Add compatibility fields
            email: user.email,
            name: user.name,
            image: user.image,
          },
        }
      : null,
    status: isLoading
      ? ('loading' as const)
      : isAuthenticated
        ? ('authenticated' as const)
        : ('unauthenticated' as const),
    update: useAuth().update,
  }
}
