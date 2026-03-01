/**
 * ConnectedSettingsPanel - linked accounts, SSO, SAML (read-only for non-admins)
 */
import { Link2, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export interface ConnectedSettingsPanelProps {
  /** Whether user has any SSO/SAML connections */
  hasSsoConnection?: boolean
  /** Whether current user is admin (can manage) */
  isAdmin?: boolean
  /** SSO connections - used to derive hasSsoConnection if not provided */
  connections?: { isActive?: boolean }[]
}

export function ConnectedSettingsPanel({
  hasSsoConnection: hasSsoProp,
  isAdmin = false,
  connections = [],
}: ConnectedSettingsPanelProps) {
  const hasSsoConnection = hasSsoProp ?? (Array.isArray(connections) && connections.some((c) => c?.isActive)) ?? false
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Connected Accounts
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          View your linked accounts and SSO/SAML associations.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">SSO / SAML</p>
                <p className="text-sm text-muted-foreground">
                  {hasSsoConnection
                    ? 'Connected via organization SSO'
                    : 'No SSO connection'}
                </p>
              </div>
            </div>
            <Badge variant={hasSsoConnection ? 'default' : 'secondary'}>
              {hasSsoConnection ? 'Connected' : 'Not connected'}
            </Badge>
          </div>
          {!isAdmin && (
            <p className="text-xs text-muted-foreground">
              SSO/SAML configuration is managed by your administrator.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
