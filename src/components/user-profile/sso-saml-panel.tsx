/**
 * SSO_SAMLPanel - Admin/Ops only
 * Overview status, connectors, quick link to User Management
 */
import { Link } from 'react-router-dom'
import { Shield, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export interface SSOSAMLPanelProps {
  /** Whether current user can manage SSO/SAML (Admin or Ops) */
  canManage?: boolean
  /** Alias for canManage - for compatibility with page usage */
  isAdminOrOps?: boolean
  connections?: unknown[]
}

export function SSOSAMLPanel({ canManage, isAdminOrOps, connections: _connections }: SSOSAMLPanelProps) {
  const canManageSSO = canManage ?? isAdminOrOps ?? false
  if (!canManageSSO) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          SSO / SAML
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Manage organization-wide SSO and SAML configuration. Configure connectors and identity providers.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Not configured</Badge>
            <span className="text-sm text-muted-foreground">
              No SSO/SAML connectors active
            </span>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard/admin/users">
              Configure in User Management
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
