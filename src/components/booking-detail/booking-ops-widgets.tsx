/**
 * Booking Ops Widgets - Operations Command Center widgets for a single booking
 * Surfaces: 7-day upcoming stay, payments due, overdue tasks, approvals, alerts
 */
import { Link } from 'react-router-dom'
import {
  Calendar,
  CreditCard,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatShortDate, formatCurrency } from '@/lib/format'
import type { BookingDetail, PaymentMilestone, ApprovalDetail } from '@/types/booking'

export interface BookingOpsWidgetsProps {
  bookingId: string
  detail: BookingDetail | null
  payments: PaymentMilestone[]
  approvals: ApprovalDetail[]
  isUpcomingStay?: boolean
  hasOverduePayment?: boolean
  hasPendingApproval?: boolean
}

export function BookingOpsWidgets({
  bookingId,
  detail: _detail,
  payments = [],
  approvals = [],
  isUpcomingStay = false,
  hasOverduePayment = false,
  hasPendingApproval = false,
}: BookingOpsWidgetsProps) {
  const unpaidPayments = (payments ?? []).filter(
    (p) => p.status === 'unpaid' || p.status === 'overdue'
  )
  const overduePayments = (payments ?? []).filter((p) => p.status === 'overdue')
  const pendingApprovals = (approvals ?? []).filter((a) => a.status === 'pending')
  const hasAlerts = hasOverduePayment || hasPendingApproval || overduePayments.length > 0

  const sections: { label: string; count: number; icon: typeof Calendar; color: string }[] = []
  if (isUpcomingStay) {
    sections.push({
      label: 'Upcoming stay (7 days)',
      count: 1,
      icon: Calendar,
      color: 'text-accent',
    })
  }
  if (unpaidPayments.length > 0) {
    sections.push({
      label: 'Payments due',
      count: unpaidPayments.length,
      icon: CreditCard,
      color: overduePayments.length > 0 ? 'text-destructive' : 'text-amber-600',
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
  if (hasAlerts && sections.length === 0) {
    sections.push({
      label: 'Alerts',
      count: 1,
      icon: AlertCircle,
      color: 'text-destructive',
    })
  }

  if (sections.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Operations Command Center</CardTitle>
        <CardDescription>Time-critical items for this booking</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sections.map(({ label, count, icon: Icon, color }) => (
            <Link
              key={label}
              to={`/dashboard/bookings/${bookingId}`}
              className="flex items-center gap-4 rounded-lg border border-border p-4 transition-all duration-200 hover:border-accent/50 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <div className={`rounded-lg bg-secondary p-3 ${color}`}>
                <Icon className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <p className="font-medium">{label}</p>
                <p className="text-2xl font-semibold">{count}</p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" aria-hidden />
            </Link>
          ))}
        </div>

        {overduePayments.length > 0 && (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <h4 className="font-medium text-destructive">Overdue payments</h4>
            <ul className="mt-2 space-y-1 text-sm">
              {(overduePayments ?? []).map((p) => (
                <li key={p.id}>
                  {p.milestone}: {formatCurrency(p.amount, p.currency)} due {formatShortDate(p.due_date)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {pendingApprovals.length > 0 && (
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
            <h4 className="font-medium text-amber-700">Pending approvals</h4>
            <ul className="mt-2 space-y-1 text-sm">
              {(pendingApprovals ?? []).map((a) => (
                <li key={a.id}>
                  Requested by {a.requester_name ?? 'Unknown'}
                  {a.due_by ? ` · Due ${formatShortDate(a.due_by)}` : ''}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
