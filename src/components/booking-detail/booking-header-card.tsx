/**
 * BookingHeaderCard - Summary header with key metadata and action controls
 * LuxeFlow design: crisp white, olive accents, soft shadows
 */
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatShortDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { BookingDetail } from '@/types/booking'

const STATUS_LABELS: Record<string, string> = {
  quote: 'Quote',
  confirmed: 'Confirmed',
  pre_arrival: 'Pre-arrival',
  in_stay: 'In-stay',
  completed: 'Completed',
}

const STATUS_VARIANTS: Record<string, string> = {
  quote: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
  confirmed: 'bg-green-500/15 text-green-700 border-green-500/30',
  pre_arrival: 'bg-blue-500/15 text-blue-700 border-blue-500/30',
  in_stay: 'bg-accent/15 text-accent border-accent/30',
  completed: 'bg-muted text-muted-foreground border-border',
}

export interface BookingHeaderCardProps {
  detail: BookingDetail | null
  isLoading?: boolean
  onSendProposal?: () => void
  onIssueInvoice?: () => void
  onRequestApproval?: () => void
}

export function BookingHeaderCard({
  detail,
  isLoading = false,
  onSendProposal,
  onIssueInvoice,
  onRequestApproval,
}: BookingHeaderCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex animate-pulse flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="h-12 w-48 rounded bg-secondary/50" />
            <div className="h-10 w-32 rounded bg-secondary/50" />
          </div>
        </CardHeader>
      </Card>
    )
  }

  if (!detail) return null

  const clientName = detail.client?.name ?? 'Unknown Client'
  const initials = clientName
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'
  const resortName = detail.resort?.name ?? ''
  const roomCategory = detail.room_category?.name ?? ''
  const statusLabel = STATUS_LABELS[detail.status] ?? detail.status
  const statusClass = STATUS_VARIANTS[detail.status] ?? 'bg-muted text-muted-foreground'

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild aria-label="Back to bookings">
          <Link to="/dashboard/bookings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-serif text-2xl font-semibold sm:text-3xl">
            Booking {detail.reference}
          </h1>
          <p className="text-muted-foreground">
            {resortName}
            {roomCategory ? ` · ${roomCategory}` : ''}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4">
              <Avatar className="h-14 w-14 shrink-0">
                <AvatarImage src={detail.client?.avatar_url} alt="" />
                <AvatarFallback className="bg-secondary text-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-serif text-xl font-semibold">{clientName}</h2>
                  <Badge variant="outline" className={cn('capitalize', statusClass)}>
                    {statusLabel}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatShortDate(detail.check_in)} – {formatShortDate(detail.check_out)}
                </p>
                <div className="mt-2 flex flex-wrap gap-6 text-sm">
                  <span>
                    <span className="text-muted-foreground">Total: </span>
                    <span className="font-medium">
                      {formatCurrency(detail.total_amount, detail.currency)}
                    </span>
                  </span>
                  <span>
                    <span className="text-muted-foreground">Outstanding: </span>
                    <span
                      className={cn(
                        'font-medium',
                        (detail.outstanding_balance ?? 0) > 0 && 'text-amber-600'
                      )}
                    >
                      {formatCurrency(detail.outstanding_balance, detail.currency)}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              {onSendProposal && (
                <Button variant="outline" size="sm" onClick={onSendProposal}>
                  Send Proposal
                </Button>
              )}
              {onIssueInvoice && (
                <Button variant="outline" size="sm" onClick={onIssueInvoice}>
                  Issue Invoice
                </Button>
              )}
              {onRequestApproval && (
                <Button size="sm" onClick={onRequestApproval}>
                  Request Approval
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}
