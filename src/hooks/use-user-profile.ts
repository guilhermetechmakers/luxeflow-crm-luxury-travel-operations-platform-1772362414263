/**
 * useUserProfile - Fetch and mutate user profile, tokens, sessions, notifications
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/auth-context'
import { userProfileApi } from '@/api/user-profile'
import type { UserProfile, NotificationSettings } from '@/types/user-profile'

function buildProfileFromAuth(user: { id: string; email?: string; name?: string } | null): UserProfile | null {
  if (!user) return null
  const now = new Date().toISOString()
  return {
    id: user.id,
    name: user.name ?? user.email ?? '',
    email: user.email ?? '',
    phone: undefined,
    avatarUrl: undefined,
    locale: 'en',
    timeZone: 'UTC',
    is2faEnabled: false,
    lastLoginAt: undefined,
    createdAt: now,
    updatedAt: now,
    active: true,
  }
}

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  channels: { email: true, sms: false, in_app: true },
  events: {
    booking_created: ['email', 'in_app'],
    booking_updated: ['email', 'in_app'],
    booking_cancelled: ['email', 'in_app'],
    payment_due: ['email', 'in_app'],
    payment_received: ['email', 'in_app'],
    system_alert: ['email', 'in_app'],
    personal_message: ['email', 'in_app'],
  },
}

export function useUserProfile() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      const p = await userProfileApi.getProfile()
      if (p) return p
      return buildProfileFromAuth(user)
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
  })

  const updateProfileMutation = useMutation({
    mutationFn: (input: Parameters<typeof userProfileApi.updateProfile>[0]) =>
      userProfileApi.updateProfile(input),
    onSuccess: (updated) => {
      if (updated) queryClient.setQueryData(['userProfile', user?.id], updated)
    },
  })

  const updateProfile = async (values: {
    name: string
    phone?: string
    locale: string
    timeZone: string
  }) => {
    return updateProfileMutation.mutateAsync(values)
  }

  return {
    profile: profile ?? null,
    isLoading,
    refetch,
    updateProfile,
    isUpdating: updateProfileMutation.isPending,
  }
}

export function useUserTokens() {
  const queryClient = useQueryClient()
  const { data: tokens = [], isLoading } = useQuery({
    queryKey: ['apiTokens'],
    queryFn: () => userProfileApi.getTokens(),
  })

  const createMutation = useMutation({
    mutationFn: (input: { name: string; scopes: string[]; expiresInDays?: number }) =>
      userProfileApi.createToken(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['apiTokens'] }),
  })

  const revokeMutation = useMutation({
    mutationFn: (tokenId: string) => userProfileApi.revokeToken(tokenId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['apiTokens'] }),
  })

  return {
    tokens: tokens ?? [],
    isLoading,
    createToken: createMutation.mutateAsync,
    revokeToken: revokeMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isRevoking: revokeMutation.isPending,
  }
}

export function useUserSessions() {
  const queryClient = useQueryClient()
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['userSessions'],
    queryFn: () => userProfileApi.getSessions(),
  })

  const logoutMutation = useMutation({
    mutationFn: () => userProfileApi.logoutAllSessions(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userSessions'] }),
  })

  return {
    sessions: sessions ?? [],
    isLoading,
    logoutAll: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  }
}

export function useNotificationSettings() {
  const queryClient = useQueryClient()
  const { data: settings, isLoading } = useQuery({
    queryKey: ['notificationSettings'],
    queryFn: async () => {
      const s = await userProfileApi.getNotifications()
      return s ?? DEFAULT_NOTIFICATIONS
    },
  })

  const updateMutation = useMutation({
    mutationFn: (s: NotificationSettings) => userProfileApi.updateNotifications(s),
    onSuccess: (updated) => {
      if (updated) queryClient.setQueryData(['notificationSettings'], updated)
    },
  })

  return {
    settings: settings ?? DEFAULT_NOTIFICATIONS,
    isLoading,
    update: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  }
}
