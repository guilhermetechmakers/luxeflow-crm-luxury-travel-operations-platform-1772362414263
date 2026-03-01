/**
 * Auth API - Supabase Auth integration
 * Handles login, logout, SSO with safe response handling
 */
import { supabase } from '@/lib/supabase'
import type { User, UserRole } from '@/types/auth'

const DEFAULT_ROLES: UserRole[] = ['Agent']

function mapSupabaseUserToUser(supabaseUser: { id: string; email?: string } | null): User | null {
  if (!supabaseUser) return null
  const email = supabaseUser.email ?? ''
  return {
    id: supabaseUser.id,
    email,
    username: undefined,
    name: undefined,
    roles: DEFAULT_ROLES,
    twoFactorEnabled: false,
  }
}

export const authApi = {
  /**
   * Sign in with email and password.
   * Supabase Auth requires email. Username is supported when backend resolves it.
   */
  async signIn(emailOrUsername: string, password: string): Promise<{ user: User; token: string }> {
    if (!emailOrUsername.includes('@')) {
      throw new Error('Please enter your email address to sign in.')
    }
    const email = emailOrUsername
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
    const user = mapSupabaseUserToUser(data?.user ?? null)
    const token = data?.session?.access_token ?? ''
    if (!user || !token) throw new Error('Authentication failed')
    return { user, token }
  },

  async signOut(): Promise<void> {
    await supabase.auth.signOut()
  },

  async signInWithGoogle(): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) throw new Error(error.message)
  },

  /**
   * Enterprise SSO - placeholder. In production, configure SAML/OIDC in Supabase.
   */
  async signInWithEnterprise(): Promise<void> {
    throw new Error('Enterprise SSO is not configured. Contact your administrator.')
  },

  async getSession(): Promise<{ user: User; token: string } | null> {
    const { data, error } = await supabase.auth.getSession()
    if (error || !data?.session) return null
    const user = mapSupabaseUserToUser(data.session.user)
    const token = data.session.access_token ?? ''
    if (!user || !token) return null
    return { user, token }
  },

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ? mapSupabaseUserToUser(session.user) : null
      callback(user)
    })
    return () => subscription.unsubscribe()
  },
}
