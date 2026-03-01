/**
 * OperationsCommandCenter Widgets - Booking-specific ops items
 * 7-day upcoming stays, payments due, overdue tasks, approvals, alerts
 */
import { Link } from 'react-router-dom'
import { Calendar, CreditCard, AlertCircle, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatShortDate, formatCurrency } from '@/lib/format'
import type { BookingDetail, PaymentMilestone, ApprovalDetail } from '@/types/booking'

export interface OpsWidgetsProps {
  bookingId: string
  detail: BookingDetail | null
  payments: PaymentMilestone[]
  approvals: ApprovalDetail[]
}

export function OpsWidgets({
  bookingId,
  detail,
  payments = [],
  approvals = [],
}: OpsWidgetsProps) {
  const checkIn = detail?.check_in
  const checkOut = detail?.check_out
  const isUpcoming =
    checkIn &&
    new Date(checkIn) >= new Date() &&
    new Date(checkIn) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const overduePayments = (payments ?? []).filter((p) => p.status === 'overdue')
  const duePayments = (payments ?? []).filter((p) => p.status === 'unpaid')
  const pendingApprovals = (approvals ?? []).filter((a) => a.status === 'pending')

  const sections = [
    {
      label: 'Upcoming stay',
      count: isUpcoming ? 1 : 0,
      icon: Calendar,
      to: `/dashboard/bookings/${bookingId}`,
      color: 'text-luxe-accent',
      detail: isUpcoming ? `${formatShortDate(checkIn)} – ${formatShortDate(checkOut)}` : null,
    },
    {
      label: 'Payments due',
      count: duePayments.length + overduePayments.length,
      icon: CreditCard,
      to: `/dashboard/bookings/${bookingId}#payments`,
      color: overduePayments.length > 0 ? 'text-destructive' : 'text-amber-600',
      detail:
        overduePayments.length > 0
          ? `${overduePayments.length} overdue`
          : duePayments.length > 0
            ? `${formatCurrency(duePayments.reduce((s, p) => s + p.amount, 0), detail?.currency ?? 'EUR')} due`
            : null,
    },
    {
      label: 'Pending approvals',
      count: pendingApprovals.length,
      icon: AlertCircle,
      to: `/dashboard/bookings/${bookingId}#approvals`,
      color: 'text-blue-600',
      detail: pendingApprovals.length > 0 ? `${pendingApprovals.length} awaiting` : null,
    },
  ]

  const hasItems = sections.some((s) => s.count > 0)
  if (!hasItems) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Operations for this booking</CardTitle>
        <p className="text-sm text-muted-foreground">
          Time-critical items and quick links
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-3">
          {sections
            .filter((s) => s.count > 0)
            .map(({ label, count, icon: Icon, to, color, detail: detailText }) => (
              <Link
                key={label}
                to={to}
                className="flex items-center gap-3 rounded-lg border border-border p-3 transition-all duration-200 hover:border-accent/50 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <div className={`rounded-lg bg-secondary p-2 ${color}`}>
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{label}</p>
                  <p className="text-sm text-muted-foreground">
                    {detailText ?? `${count} item(s)`}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              </Link>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
