/**
 * User Profile page - Personal hub for profile, security, notifications, tokens, sessions
 */
import { useCallback, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { User, Shield, Bell, Key, Monitor, Link2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { userProfileApi, uploadAvatar } from '@/api/user-profile'
import { useAuth } from '@/contexts/auth-context'
import { useUserTokens, useNotificationSettings } from '@/hooks/use-user-profile'
import { toast } from 'sonner'
import { ProfileHeaderCard } from '@/components/user-profile/profile-header-card'
import { ProfileForm } from '@/components/user-profile/profile-form'
import { SecurityPanel } from '@/components/user-profile/security-panel'
import { NotificationPreferencesPanel } from '@/components/user-profile/notification-preferences-panel'
import { ApiTokensPanel } from '@/components/user-profile/api-tokens-panel'
import { ActivitySessionsPanel } from '@/components/user-profile/activity-sessions-panel'
import { SSOSAMLPanel } from '@/components/user-profile/sso-saml-panel'
import { ConnectedSettingsPanel } from '@/components/user-profile/connected-settings-panel'

export function UserProfile() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [avatarUploading, setAvatarUploading] = useState(false)
  const {
    tokens,
    isLoading: tokensLoading,
    createToken,
    revokeToken,
    isCreating: tokensCreating,
    isRevoking: tokensRevoking,
  } = useUserTokens()
  const {
    settings: notificationSettings,
    isLoading: notificationsLoading,
    update: updateNotifications,
    isUpdating: notificationsUpdating,
  } = useNotificationSettings()

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => userProfileApi.getProfile(),
  })

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['userSessions'],
    queryFn: () => userProfileApi.getSessions(),
  })

  const { data: ssoConnections = [] } = useQuery({
    queryKey: ['userSso'],
    queryFn: () => userProfileApi.getSsoConnections(),
  })

  const updateProfileMutation = useMutation({
    mutationFn: (payload: Parameters<typeof userProfileApi.updateProfile>[0]) =>
      userProfileApi.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] })
      toast.success('Profile updated')
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to update profile'),
  })

  const changePasswordMutation = useMutation({
    mutationFn: ({ current, new: n }: { current: string; new: string }) =>
      userProfileApi.changePassword(current, n),
    onSuccess: (res) => {
      if (res?.success) toast.success('Password updated')
      else toast.error(res?.message ?? 'Failed to update password')
    },
    onError: () => toast.error('Failed to update password'),
  })

  const handleAvatarChange = useCallback(
    async (file: File) => {
      if (!profile?.id) return
      setAvatarUploading(true)
      try {
        const url = await uploadAvatar(file, profile.id)
        await userProfileApi.updateProfile({ avatarUrl: url })
        queryClient.invalidateQueries({ queryKey: ['userProfile'] })
        toast.success('Avatar updated')
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to upload avatar')
      } finally {
        setAvatarUploading(false)
      }
    },
    [profile?.id, queryClient]
  )

  const handleProfileSubmit = useCallback(
    (data: { name: string; email: string; phone?: string; locale: string; timeZone: string }) => {
      updateProfileMutation.mutate({
        name: data.name,
        email: data.email,
        phone: data.phone,
        locale: data.locale,
        timeZone: data.timeZone,
      })
    },
    [updateProfileMutation]
  )

  const handleChangePassword = useCallback(
    (current: string, newPw: string) => {
      changePasswordMutation.mutate({ current, new: newPw })
    },
    [changePasswordMutation]
  )

  const handleSetup2fa = useCallback(async () => {
    const res = await userProfileApi.setup2FA()
    if (res) return
    toast.error('2FA setup is not available. Configure backend first.')
  }, [])

  const handleVerify2fa = useCallback(async (code: string) => {
    const res = await userProfileApi.verify2FA(code)
    if (res?.success) {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] })
      toast.success('2FA enabled')
    } else {
      toast.error('Invalid code')
    }
  }, [queryClient])

  const handleDisable2fa = useCallback(async () => {
    const res = await userProfileApi.disable2FA()
    if (res.success) {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] })
      toast.success('2FA disabled')
    } else {
      toast.error(res.message ?? 'Failed to disable 2FA')
    }
  }, [queryClient])

  const handleLogoutAll = useCallback(async () => {
    const ok = await userProfileApi.logoutAllSessions()
    if (ok) {
      queryClient.invalidateQueries({ queryKey: ['userSessions'] })
      toast.success('Signed out from all other devices')
    } else {
      toast.error('Failed to sign out other sessions')
    }
  }, [queryClient])

  const isAdminOrOps = (user?.roles ?? []).includes('Admin') || (user?.roles ?? []).includes('Ops')
  const isAdmin = (user?.roles ?? []).includes('Admin')

  if (profileLoading || !profile) {
    return (
      <div className="mx-auto max-w-4xl animate-fade-in">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold">User Profile</h1>
          <p className="mt-1 text-muted-foreground">Manage your account settings</p>
        </div>
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl animate-fade-in">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold">User Profile</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your account, security, and preferences
        </p>
      </div>

      <ProfileHeaderCard
        profile={profile}
        onAvatarChange={handleAvatarChange}
        isLoading={avatarUploading}
      />

      <Tabs defaultValue="profile" className="mt-8">
        <TabsList className="mb-6 flex w-full flex-wrap gap-2 bg-muted/50">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="tokens" className="gap-2">
            <Key className="h-4 w-4" />
            API Tokens
          </TabsTrigger>
          <TabsTrigger value="sessions" className="gap-2">
            <Monitor className="h-4 w-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="connected" className="gap-2">
            <Link2 className="h-4 w-4" />
            Connected
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileForm
            profile={profile}
            onSubmit={handleProfileSubmit}
            isLoading={updateProfileMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="security">
          <SecurityPanel
            is2faEnabled={profile.is2faEnabled}
            onChangePassword={handleChangePassword}
            onSetup2fa={handleSetup2fa}
            onDisable2fa={handleDisable2fa}
            onVerify2fa={handleVerify2fa}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationPreferencesPanel
            settings={notificationSettings}
            isLoading={notificationsLoading}
            onUpdate={async (s) => { await updateNotifications(s) }}
            isUpdating={notificationsUpdating}
          />
        </TabsContent>

        <TabsContent value="tokens">
          <ApiTokensPanel
            tokens={tokens}
            isLoading={tokensLoading}
            onCreateToken={async (name, scopes, expiresInDays) => {
              try {
                const res = await createToken({ name, scopes, expiresInDays })
                if (res) {
                  toast.success('Token created. Copy it now—you won\'t see it again.')
                  return { plainToken: (res as { plainToken?: string }).plainToken ?? '' }
                }
              } catch {
                toast.error('Failed to create token')
              }
              return null
            }}
            onRevokeToken={async (id) => {
              try {
                await revokeToken(id)
                toast.success('Token revoked')
                return true
              } catch {
                toast.error('Failed to revoke token')
                return false
              }
            }}
            isCreating={tokensCreating}
            isRevoking={tokensRevoking}
          />
        </TabsContent>

        <TabsContent value="sessions">
          <ActivitySessionsPanel
            sessions={sessions}
            onLogoutAll={handleLogoutAll}
            isLoading={sessionsLoading}
          />
        </TabsContent>

        <TabsContent value="connected">
          <div className="space-y-6">
            <SSOSAMLPanel connections={ssoConnections} isAdminOrOps={isAdminOrOps} />
            <ConnectedSettingsPanel connections={ssoConnections} isAdmin={isAdmin} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
