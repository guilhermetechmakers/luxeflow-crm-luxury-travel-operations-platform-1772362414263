/**
 * ActivitySessionsPanel - Recent sessions with logout controls
 */
import { Monitor } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ConfirmationDialog } from './confirmation-dialog'
import { useState } from 'react'
import type { Session } from '@/types/user-profile'

function formatDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleString()
}

export interface ActivitySessionsPanelProps {
  sessions: Session[]
  onLogoutAll?: () => void | Promise<void>
  isLoading?: boolean
}

export function ActivitySessionsPanel({
  sessions,
  onLogoutAll,
  isLoading = false,
}: ActivitySessionsPanelProps) {
  const [logoutAllOpen, setLogoutAllOpen] = useState(false)

  const otherSessions = (sessions ?? []).filter((s) => !s.isCurrent)

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Active sessions</CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage your active sessions and sign out from other devices.
            </p>
          </div>
          {otherSessions.length > 0 && onLogoutAll && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLogoutAllOpen(true)}
              disabled={isLoading}
            >
              Sign out all others
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : (sessions ?? []).length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-8 text-center">
              <Monitor className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No sessions found</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {(sessions ?? []).map((session) => (
                <li
                  key={session.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4 transition-shadow hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Monitor className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {session.deviceName}
                        {session.isCurrent && (
                          <span className="ml-2 text-xs font-normal text-accent">(current)</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.ipAddress} · {formatDate(session.lastUsedAt)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={logoutAllOpen}
        onOpenChange={setLogoutAllOpen}
        title="Sign out from all other devices"
        description="You will remain signed in on this device. All other sessions will be terminated."
        confirmLabel="Sign out all"
        onConfirm={async () => {
          await onLogoutAll?.()
        }}
      />
    </>
  )
}
