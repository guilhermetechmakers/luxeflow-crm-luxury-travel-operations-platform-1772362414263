/**
 * VipFlagsPanel - Toggleable flags with audit trail
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/format'
import type { VIPFlag } from '@/types/client-detail'

export interface VipFlagsPanelProps {
  vipFlags: VIPFlag[]
  isLoading?: boolean
}

export function VipFlagsPanel({
  vipFlags,
  isLoading = false,
}: VipFlagsPanelProps) {
  const list = vipFlags ?? []
  const activeFlags = list.filter((f) => f.isActive)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>VIP Flags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-16 animate-pulse rounded-lg bg-secondary/50" aria-hidden />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>VIP Flags</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeFlags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {activeFlags.map((flag) => (
              <Badge
                key={flag.id}
                variant="secondary"
                className="bg-luxe-supporting/20 text-luxe-supporting border-luxe-supporting/40"
              >
                {flag.flagName}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No VIP flags set</p>
        )}

        {list.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">
              Audit Trail
            </h4>
            <ul className="mt-2 space-y-2">
              {list.map((flag) => (
                <li
                  key={flag.id}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span className="capitalize">{flag.flagName}</span>
                  <span className="text-muted-foreground">
                    {flag.isActive ? 'Active' : 'Inactive'} • Set by {flag.setBy} •{' '}
                    {formatDate(flag.changedAt)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
