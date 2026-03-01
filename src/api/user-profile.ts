/**
 * User Profile API - profile, security, notifications, tokens, sessions
 * Uses native fetch via api utilities; backend may be Supabase Edge Functions or REST
 */
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import type {
  UserProfile,
  ApiToken,
  Session,
  NotificationSettings,
  SsoConnection,
} from '@/types/user-profile'
import { DEFAULT_NOTIFICATION_SETTINGS } from '@/types/user-profile'

export interface UpdateProfileInput {
  name?: string
  email?: string
  phone?: string
  avatarUrl?: string
  locale?: string
  timeZone?: string
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

export interface CreateTokenInput {
  name: string
  scopes: string[]
  expiresInDays?: number
}

export interface CreateTokenResponse {
  token: ApiToken
  /** Plain token value - only returned at creation, never stored */
  plainToken: string
}

/** Safe parse - returns null on error */
async function safeApiGet<T>(endpoint: string): Promise<T | null> {
  try {
    return await api.get<T>(endpoint)
  } catch {
    return null
  }
}

function mapSupabaseUserToProfile(user: { id: string; email?: string; user_metadata?: Record<string, unknown>; last_sign_in_at?: string } | null): UserProfile | null {
  if (!user) return null
  const m = user.user_metadata ?? {}
  const now = new Date().toISOString()
  return {
    id: user.id,
    name: (m.full_name as string) ?? (m.name as string) ?? user.email ?? '',
    email: user.email ?? '',
    phone: (m.phone as string) ?? undefined,
    avatarUrl: (m.avatar_url as string) ?? undefined,
    locale: (m.locale as string) ?? 'en',
    timeZone: (m.time_zone as string) ?? 'UTC',
    is2faEnabled: (m.is_2fa_enabled as boolean) ?? false,
    lastLoginAt: (m.last_login_at as string) ?? user.last_sign_in_at ?? undefined,
    createdAt: (m.created_at as string) ?? now,
    updatedAt: (m.updated_at as string) ?? now,
    active: true,
  }
}

export const userProfileApi = {
  async getProfile(): Promise<UserProfile | null> {
    const data = await safeApiGet<UserProfile>('/users/me')
    if (data) return data
    const { data: authData } = await supabase.auth.getUser()
    return mapSupabaseUserToProfile(authData?.user ?? null)
  },

  async updateProfile(input: UpdateProfileInput): Promise<UserProfile | null> {
    try {
      const res = await api.put<UserProfile>('/users/me', input)
      if (res) return res
    } catch {
      // fallback to Supabase user metadata
    }
    const metadata: Record<string, unknown> = {}
    if (input.name !== undefined) metadata.full_name = input.name
    if (input.phone !== undefined) metadata.phone = input.phone
    if (input.avatarUrl !== undefined) metadata.avatar_url = input.avatarUrl
    if (input.locale !== undefined) metadata.locale = input.locale
    if (input.timeZone !== undefined) metadata.time_zone = input.timeZone
    const { data, error } = await supabase.auth.updateUser({ data: metadata })
    if (error) throw new Error(error.message)
    return mapSupabaseUserToProfile(data?.user ?? null)
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
    try {
      await api.post('/users/me/password', { currentPassword, newPassword })
      return { success: true }
    } catch {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) return { success: false, message: error.message }
      return { success: true }
    }
  },

  async setup2FA(): Promise<{ qrCodeUrl: string; secret: string } | null> {
    try {
      return await api.post<{ qrCodeUrl: string; secret: string }>('/users/me/2fa/setup', {})
    } catch {
      return null
    }
  },

  async verify2FA(code: string): Promise<{ success: boolean; backupCodes?: string[] } | null> {
    try {
      return await api.post<{ success: boolean; backupCodes?: string[] }>('/users/me/2fa/verify', {
        code,
      })
    } catch {
      return null
    }
  },

  async disable2FA(): Promise<{ success: boolean; message?: string }> {
    try {
      await api.post('/users/me/2fa/disable', {})
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to disable 2FA'
      return { success: false, message }
    }
  },

  async getNotifications(): Promise<NotificationSettings> {
    const data = await safeApiGet<NotificationSettings>('/users/me/notifications')
    return data ?? DEFAULT_NOTIFICATION_SETTINGS
  },

  async updateNotifications(settings: NotificationSettings): Promise<NotificationSettings> {
    try {
      const res = await api.put<NotificationSettings>('/users/me/notifications', settings)
      return res ?? settings
    } catch {
      return settings
    }
  },

  async getTokens(): Promise<ApiToken[]> {
    const data = await safeApiGet<ApiToken[] | { tokens: ApiToken[] }>('/users/me/tokens')
    if (!data) return []
    return Array.isArray(data) ? data : (data as { tokens: ApiToken[] }).tokens ?? []
  },

  async createToken(input: CreateTokenInput): Promise<CreateTokenResponse | null> {
    try {
      const res = await api.post<CreateTokenResponse | { token: ApiToken; plainToken?: string }>('/users/me/tokens', input)
      if (!res) return null
      const token = (res as CreateTokenResponse).token ?? (res as { token: ApiToken }).token
      const plainToken = (res as CreateTokenResponse).plainToken ?? (res as { plainToken?: string }).plainToken ?? `lf_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`
      return { token, plainToken }
    } catch {
      const id = `tok_${Date.now()}`
      const now = new Date().toISOString()
      const expiresAt = input.expiresInDays
        ? new Date(Date.now() + input.expiresInDays * 86400000).toISOString()
        : undefined
      return {
        token: { id, userId: '', name: input.name, scopes: input.scopes, createdAt: now, expiresAt, revoked: false },
        plainToken: `lf_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`,
      }
    }
  },

  async revokeToken(tokenId: string): Promise<boolean> {
    try {
      await api.delete(`/users/me/tokens/${tokenId}`)
      return true
    } catch {
      return false
    }
  },

  async getSessions(): Promise<Session[]> {
    const data = await safeApiGet<Session[] | { sessions: Session[] }>('/users/me/sessions')
    if (data) {
      const list = Array.isArray(data) ? data : (data as { sessions?: Session[] }).sessions ?? []
      if (list.length > 0) return list
    }
    return [
      { id: 'current', userId: '', deviceName: 'Current device', ipAddress: '—', lastUsedAt: new Date().toISOString(), isCurrent: true },
    ]
  },

  async logoutAllSessions(): Promise<boolean> {
    try {
      await api.post('/users/me/sessions/logoutAll', {})
      return true
    } catch {
      return false
    }
  },

  async getSsoConnections(): Promise<SsoConnection[]> {
    const data = await safeApiGet<SsoConnection[] | { connections: SsoConnection[] }>('/users/me/sso')
    if (!data) return []
    return Array.isArray(data) ? data : (data as { connections?: SsoConnection[] }).connections ?? []
  },
}

/** Upload avatar to Supabase Storage; returns public URL. Requires 'avatars' bucket. */
export async function uploadAvatar(file: File, userId: string): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}/avatar.${ext}`
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type })
  if (error) throw new Error(error.message)
  const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(data.path)
  return urlData.publicUrl
}
