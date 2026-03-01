/**
 * BookingOperationsWidgets - OCC widgets wired to BookingDetail context
 * Surfaces 7-day upcoming stays, payments due, overdue tasks, approvals, alerts
 */
import { Link } from 'react-router-dom'
import {
  Calendar,
  CreditCard,
  CheckSquare,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatShortDate, formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { BookingDetail, PaymentMilestone, ApprovalDetail } from '@/types/booking'

export interface BookingOperationsWidgetsProps {
  bookingId: string
  detail: BookingDetail | null
  payments: PaymentMilestone[]
  approvals: ApprovalDetail[]
  deadlines?: { id: string; title: string; due_date: string; type: string }[]
}

export function BookingOperationsWidgets({
  bookingId,
  detail,
  payments = [],
  approvals = [],
  deadlines = [],
}: BookingOperationsWidgetsProps) {
  const paymentList = payments ?? []
  const approvalList = approvals ?? []
  const deadlineList = deadlines ?? []

  const isUpcoming =
    detail?.check_in &&
    new Date(detail.check_in) >= new Date() &&
    new Date(detail.check_in) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const paymentsDue = paymentList.filter(
    (p) =>
      (p.status === 'unpaid' || p.status === 'overdue') &&
      new Date(p.due_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  )

  const overduePayments = paymentList.filter(
    (p) => p.status !== 'paid' && new Date(p.due_date) < new Date()
  )

  const pendingApprovals = approvalList.filter((a) => a.status === 'pending')

  const overdueDeadlines = deadlineList.filter(
    (d) => new Date(d.due_date) < new Date()
  )

  const hasAlerts =
    isUpcoming ||
    paymentsDue.length > 0 ||
    overduePayments.length > 0 ||
    pendingApprovals.length > 0 ||
    overdueDeadlines.length > 0

  if (!hasAlerts) return null

  const sections: Array<{
    label: string
    count: number
    icon: typeof Calendar
    color: string
    items?: React.ReactNode
  }> = []

  if (isUpcoming && detail?.check_in) {
    sections.push({
      label: 'Check-in',
      count: 1,
      icon: Calendar,
      color: 'text-accent',
      items: (
        <p className="text-sm text-muted-foreground">
          {formatShortDate(detail.check_in)} – {detail.resort?.name ?? ''}
        </p>
      ),
    })
  }

  if (paymentsDue.length > 0 || overduePayments.length > 0) {
    const totalDue = [...paymentsDue, ...overduePayments].reduce(
      (sum, p) => sum + (p.amount ?? 0),
      0
    )
    const currency = paymentsDue[0]?.currency ?? detail?.currency ?? 'EUR'
    sections.push({
      label: overduePayments.length > 0 ? 'Overdue payments' : 'Payments due',
      count: paymentsDue.length + overduePayments.length,
      icon: CreditCard,
      color: overduePayments.length > 0 ? 'text-destructive' : 'text-amber-600',
      items: (
        <p className="text-sm text-muted-foreground">
          {formatCurrency(totalDue, currency)} total
        </p>
      ),
    })
  }

  if (pendingApprovals.length > 0) {
    sections.push({
      label: 'Pending approvals',
      count: pendingApprovals.length,
      icon: AlertCircle,
      color: 'text-blue-600',
    })
  }

  if (overdueDeadlines.length > 0) {
    sections.push({
      label: 'Overdue deadlines',
      count: overdueDeadlines.length,
      icon: CheckSquare,
      color: 'text-destructive',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Operations Alerts</CardTitle>
        <CardDescription>
          Time-critical items for this booking
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {sections.map(({ label, count, icon: Icon, color, items }) => (
            <Link
              key={label}
              to={`/dashboard/bookings/${bookingId}#${label.toLowerCase().replace(/\s+/g, '-')}`}
              className={cn(
                'flex flex-col gap-2 rounded-lg border border-border p-4 transition-all duration-200',
                'hover:border-accent/50 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn('rounded-lg bg-secondary p-2', color)}>
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{label}</p>
                  <p className="text-2xl font-semibold">{count}</p>
                  {items}
                </div>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
