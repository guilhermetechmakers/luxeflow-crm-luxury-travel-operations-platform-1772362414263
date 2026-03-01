/**
 * Auth context - session, user, roles with safe defaults
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { authApi } from '@/api/auth'
import type { User } from '@/types/auth'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthContextValue extends AuthState {
  signIn: (emailOrUsername: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithEnterprise: () => Promise<void>
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState)

  const loadSession = useCallback(async () => {
    try {
      const session = await authApi.getSession()
      if (session) {
        setState({
          user: session.user,
          token: session.token,
          isLoading: false,
          isAuthenticated: true,
        })
      } else {
        setState({
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    } catch {
      setState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      })
    }
  }, [])

  useEffect(() => {
    loadSession()
    const unsubscribe = authApi.onAuthStateChange(() => loadSession())
    return unsubscribe
  }, [loadSession])

  const signIn = useCallback(
    async (emailOrUsername: string, password: string) => {
      const { user, token } = await authApi.signIn(emailOrUsername, password)
      setState({
        user,
        token,
        isLoading: false,
        isAuthenticated: true,
      })
    },
    []
  )

  const signOut = useCallback(async () => {
    await authApi.signOut()
    setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    })
  }, [])

  const signInWithGoogle = useCallback(async () => {
    await authApi.signInWithGoogle()
  }, [])

  const signInWithEnterprise = useCallback(async () => {
    await authApi.signInWithEnterprise()
  }, [])

  const value: AuthContextValue = {
    ...state,
    signIn,
    signOut,
    signInWithGoogle,
    signInWithEnterprise,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
