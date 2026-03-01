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

  /**
   * Request password reset email. Supabase sends a link to the redirect URL.
   */
  async requestPasswordReset(email: string): Promise<void> {
    const redirectTo = `${window.location.origin}/reset-password`
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
    if (error) throw new Error(error.message)
  },

  /**
   * Update password (used after recovery link). Requires active recovery session.
   */
  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw new Error(error.message)
  },

  /**
   * Check if current session is from a password recovery flow.
   * Supabase establishes session when user lands from reset link (hash).
   * Check hash first before getSession processes it.
   */
  async hasRecoverySession(): Promise<boolean> {
    const urlHash = typeof window !== 'undefined' ? window.location.hash : ''
    if (!urlHash.includes('type=recovery')) return false
    const { data } = await supabase.auth.getSession()
    return !!(data?.session)
  },

  /**
   * Get email verification status. Uses Supabase user's email_confirmed_at.
   * Returns status, email, and optional onboarding steps.
   */
  async getVerificationStatus(): Promise<{
    status: 'pending' | 'verified' | 'failed'
    email?: string
    steps?: Array<{ id: string; label: string; completed: boolean }>
  }> {
    try {
      const { data, error } = await supabase.auth.getUser()
      if (error) {
        return { status: 'failed' }
      }
      const user = data?.user ?? null
      if (!user) {
        return { status: 'pending' }
      }
      const email = user.email ?? ''
      const isVerified = !!user.email_confirmed_at
      const steps = [
        { id: 'profile', label: 'Complete Profile', completed: !!user.user_metadata?.full_name },
        { id: 'team', label: 'Invite Team', completed: false },
      ]
      return {
        status: isVerified ? 'verified' : 'pending',
        email,
        steps,
      }
    } catch {
      return { status: 'failed' }
    }
  },

  /**
   * Resend verification email. Uses Supabase auth.resend with type 'signup'.
   * Rate limiting is enforced by Supabase; client should implement cooldown.
   */
  async resendVerificationEmail(email: string): Promise<{
    success: boolean
    message?: string
    nextRetrySeconds?: number
  }> {
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return { success: false, message: 'Valid email is required' }
    }
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      })
      if (error) {
        const msg = error.message ?? 'Failed to resend verification email'
        const nextRetrySeconds = msg.toLowerCase().includes('rate')
          ? 60
          : undefined
        return { success: false, message: msg, nextRetrySeconds }
      }
      return { success: true, message: 'Verification email sent' }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resend'
      return { success: false, message }
    }
  },
}
