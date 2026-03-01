/**
 * ApprovalsPanel - Current approvals, history, approve/deny/escalate actions
 */
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { ApprovalDetail } from '@/types/booking'

export interface ApprovalsPanelProps {
  approvals: ApprovalDetail[]
  isLoading?: boolean
  onRequestApproval?: () => void
  onApprove?: (approvalId: string) => void
  onDeny?: (approvalId: string) => void
  canEdit?: boolean
}

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; icon: typeof Clock }
> = {
  pending: {
    label: 'Pending',
    className: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
    icon: Clock,
  },
  approved: {
    label: 'Approved',
    className: 'bg-green-500/15 text-green-700 border-green-500/30',
    icon: CheckCircle,
  },
  denied: {
    label: 'Denied',
    className: 'bg-destructive/15 text-destructive border-destructive/30',
    icon: XCircle,
  },
}

export function ApprovalsPanel({
  approvals = [],
  isLoading = false,
  onRequestApproval,
  onApprove,
  onDeny,
  canEdit = false,
}: ApprovalsPanelProps) {
  const list = (approvals ?? []).sort((a, b) => {
    const aDate = a.due_by ?? ''
    const bDate = b.due_by ?? ''
    return bDate.localeCompare(aDate)
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-16 animate-pulse rounded-lg bg-secondary/50" />
            <div className="h-16 animate-pulse rounded-lg bg-secondary/50" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Approvals</CardTitle>
          {canEdit && onRequestApproval && (
            <Button size="sm" onClick={onRequestApproval}>
              Request Approval
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
            <CheckCircle
              className="h-12 w-12 text-muted-foreground"
              aria-hidden
            />
            <p className="mt-4 text-muted-foreground">No approval requests</p>
            {canEdit && onRequestApproval && (
              <Button size="sm" className="mt-4" onClick={onRequestApproval}>
                Request Approval
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {(list ?? []).map((approval) => {
              const config =
                STATUS_CONFIG[approval.status ?? 'pending'] ??
                STATUS_CONFIG.pending
              const Icon = config.icon
              const isPending = approval.status === 'pending'

              return (
                <div
                  key={approval.id}
                  className={cn(
                    'rounded-lg border border-border p-4 transition-all duration-200',
                    'hover:border-accent/30'
                  )}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn('shrink-0', config.className)}
                        >
                          <Icon className="mr-1 h-3 w-3" aria-hidden />
                          {config.label}
                        </Badge>
                        {approval.due_by && isPending && (
                          <span className="text-xs text-muted-foreground">
                            Due {formatDate(approval.due_by)}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Requested by {approval.requester_name ?? 'Unknown'}
                      </p>
                      {(approval.history ?? []).length > 0 && (
                        <div className="mt-2 space-y-1">
                          {(approval.history ?? []).map((h, i) => (
                            <p
                              key={i}
                              className="text-xs text-muted-foreground"
                            >
                              {h.action} by {h.actor} ·{' '}
                              {formatDate(h.timestamp)}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                    {canEdit && isPending && onApprove && onDeny && (
                      <div className="flex shrink-0 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => onDeny(approval.id)}
                        >
                          Deny
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onApprove(approval.id)}
                        >
                          Approve
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
