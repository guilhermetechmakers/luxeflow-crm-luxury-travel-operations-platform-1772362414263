/**
 * NotificationPreferencesPanel - per-channel and per-event toggles
 */
import { Mail, MessageSquare, Bell } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import {
  type NotificationSettings,
  type NotificationChannel,
  type NotificationEvent,
  NOTIFICATION_EVENT_LABELS,
} from '@/types/user-profile'

const CHANNEL_LABELS: Record<NotificationChannel, { label: string; icon: typeof Mail }> = {
  email: { label: 'Email', icon: Mail },
  sms: { label: 'SMS', icon: MessageSquare },
  in_app: { label: 'In-app', icon: Bell },
}

export interface NotificationPreferencesPanelProps {
  settings: NotificationSettings
  isLoading?: boolean
  onUpdate: (settings: NotificationSettings) => Promise<void>
  isUpdating?: boolean
}

export function NotificationPreferencesPanel({
  settings,
  isLoading = false,
  onUpdate,
  isUpdating = false,
}: NotificationPreferencesPanelProps) {
  const handleChannelToggle = (channel: NotificationChannel, enabled: boolean) => {
    const next: NotificationSettings = {
      channels: { ...settings.channels, [channel]: enabled },
      events: { ...settings.events },
    }
    if (!enabled) {
      (Object.keys(next.events) as NotificationEvent[]).forEach((ev) => {
        next.events[ev] = (next.events[ev] ?? []).filter((c) => c !== channel)
      })
    }
    onUpdate(next)
  }

  const handleEventChannel = (event: NotificationEvent, channel: NotificationChannel, checked: boolean) => {
    const current = (settings.events[event] ?? []) as NotificationChannel[]
    const nextChannels = checked
      ? [...current.filter((c) => c !== channel), channel]
      : current.filter((c) => c !== channel)
    const next: NotificationSettings = {
      channels: settings.channels,
      events: { ...settings.events, [event]: nextChannels },
    }
    onUpdate(next)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose how and when you receive notifications.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Channels
          </Label>
          <div className="mt-3 flex flex-wrap gap-6">
            {(Object.keys(CHANNEL_LABELS) as NotificationChannel[]).map((ch) => {
              const { label, icon: Icon } = CHANNEL_LABELS[ch]
              return (
                <div key={ch} className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`channel-${ch}`}
                      checked={settings.channels[ch] ?? false}
                      onCheckedChange={(v) => handleChannelToggle(ch, v)}
                      disabled={isUpdating}
                    />
                    <Label htmlFor={`channel-${ch}`} className="cursor-pointer font-normal">
                      {label}
                    </Label>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Events
          </Label>
          <div className="mt-3 space-y-4">
            {(Object.keys(NOTIFICATION_EVENT_LABELS ?? {}) as NotificationEvent[]).length > 0
              ? (Object.keys(NOTIFICATION_EVENT_LABELS ?? {}) as NotificationEvent[]).map((event) => (
                  <div
                    key={event}
                    className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-4"
                  >
                    <span className="text-sm font-medium">
                      {(NOTIFICATION_EVENT_LABELS as Record<NotificationEvent, string>)?.[event] ?? event}
                    </span>
                    <div className="flex flex-wrap gap-4">
                      {(Object.keys(CHANNEL_LABELS) as NotificationChannel[]).map((ch) => {
                        if (!settings.channels[ch]) return null
                        const eventChannels = (settings.events[event] ?? []) as NotificationChannel[]
                        const checked = eventChannels.includes(ch)
                        return (
                          <div key={ch} className="flex items-center gap-2">
                            <Checkbox
                              id={`${event}-${ch}`}
                              checked={checked}
                              onCheckedChange={(v) =>
                                handleEventChannel(event, ch, v === true)
                              }
                              disabled={isUpdating}
                            />
                            <Label
                              htmlFor={`${event}-${ch}`}
                              className="cursor-pointer text-sm font-normal"
                            >
                              {CHANNEL_LABELS[ch].label}
                            </Label>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))
              : null}
          </div>
        </div>

        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Preview
          </p>
          <p className="mt-2 text-sm text-foreground">
            You will receive booking updates via{' '}
            {(settings.events.booking_created ?? [])
              .map((c) => CHANNEL_LABELS[c as NotificationChannel]?.label ?? c)
              .join(', ') || 'no channels'}
            .
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
