/**
 * PaymentScheduleTable - Invoices/milestones with due dates, statuses, payment links
 */
import { Calendar, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatShortDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { PaymentMilestone } from '@/types/booking'

export interface PaymentScheduleTableProps {
  payments: PaymentMilestone[]
  isLoading?: boolean
  onCreatePayment?: () => void
  onMarkPaid?: (paymentId: string) => void
  canEdit?: boolean
}

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; icon: typeof CheckCircle }
> = {
  paid: {
    label: 'Paid',
    className: 'bg-green-500/15 text-green-700 border-green-500/30',
    icon: CheckCircle,
  },
  unpaid: {
    label: 'Unpaid',
    className: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
    icon: AlertCircle,
  },
  overdue: {
    label: 'Overdue',
    className: 'bg-destructive/15 text-destructive border-destructive/30',
    icon: AlertCircle,
  },
}

export function PaymentScheduleTable({
  payments = [],
  isLoading = false,
  onCreatePayment,
  onMarkPaid,
  canEdit = false,
}: PaymentScheduleTableProps) {
  const list = payments ?? []

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-lg bg-secondary/50"
                aria-hidden
              />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Payment Schedule</CardTitle>
          {canEdit && onCreatePayment && (
            <Button size="sm" onClick={onCreatePayment}>
              Add Milestone
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground" aria-hidden />
            <p className="mt-4 text-muted-foreground">No payment milestones</p>
            {canEdit && onCreatePayment && (
              <Button size="sm" className="mt-4" onClick={onCreatePayment}>
                Add First Milestone
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {(list ?? []).map((payment) => {
              const config =
                STATUS_CONFIG[payment.status ?? 'unpaid'] ??
                STATUS_CONFIG.unpaid
              const Icon = config.icon
              const isOverdue =
                (payment.status === 'unpaid' || payment.status === 'overdue') &&
                new Date(payment.due_date) < new Date()

              return (
                <div
                  key={payment.id}
                  className={cn(
                    'flex flex-col gap-2 rounded-lg border border-border p-4 transition-all duration-200 sm:flex-row sm:items-center sm:justify-between',
                    'hover:border-accent/30'
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{payment.milestone ?? 'Unnamed'}</p>
                    <p className="text-sm text-muted-foreground">
                      Due {formatShortDate(payment.due_date)}
                      {payment.paid_at ? (
                        <span className="ml-2">
                          · Paid {formatShortDate(payment.paid_at)}
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">
                      {formatCurrency(payment.amount, payment.currency)}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        'shrink-0',
                        config.className,
                        isOverdue && payment.status !== 'paid' && 'border-destructive'
                      )}
                    >
                      <Icon className="mr-1 h-3 w-3" aria-hidden />
                      {config.label}
                    </Badge>
                    {payment.payment_link && payment.status !== 'paid' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        aria-label="Open payment link"
                      >
                        <a
                          href={payment.payment_link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" aria-hidden />
                        </a>
                      </Button>
                    )}
                    {canEdit &&
                      onMarkPaid &&
                      payment.status !== 'paid' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onMarkPaid(payment.id)}
                        >
                          Mark Paid
                        </Button>
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
