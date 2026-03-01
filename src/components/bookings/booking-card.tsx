/**
 * BookingCard - Compact card for pipeline view with key fields and actions
 */
import { Link } from 'react-router-dom'
import { ExternalLink, Bell, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatShortDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { BookingSummary, BookingStatus } from '@/types/booking'
import { bookingsApi } from '@/api/bookings'
import { toast } from 'sonner'

const STATUS_STYLES: Record<BookingStatus, string> = {
  quote: 'bg-secondary text-muted-foreground border-border',
  confirmed: 'bg-accent/15 text-accent border-accent/30',
  pre_arrival: 'bg-blue-500/15 text-blue-700 border-blue-500/30',
  in_stay: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
  completed: 'bg-muted text-muted-foreground border-border',
}

function getStatusLabel(status: BookingStatus): string {
  const map: Record<BookingStatus, string> = {
    quote: 'Quote',
    confirmed: 'Confirmed',
    pre_arrival: 'Pre-arrival',
    in_stay: 'In-stay',
    completed: 'Completed',
  }
  return map[status] ?? status
}

export interface BookingCardProps {
  booking: BookingSummary
}

export function BookingCard({ booking }: BookingCardProps) {
  const handleReminder = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await bookingsApi.sendReminder(booking.id)
      toast.success('Reminder sent')
    } catch {
      toast.error('Failed to send reminder')
    }
  }

  const handleInvoice = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await bookingsApi.createInvoice(booking.id)
      toast.success('Invoice created')
    } catch {
      toast.error('Failed to create invoice')
    }
  }

  return (
    <Link to={`/dashboard/bookings/${booking.id}`} className="block group">
      <div
        className="rounded-lg border border-border bg-card p-4 shadow-card transition-all duration-200 hover:border-accent/50 hover:shadow-card-hover"
        role="article"
        aria-label={`Booking ${booking.booking_ref}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground truncate">
              {booking.booking_ref}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {booking.client_name}
            </p>
            <p className="mt-1 text-sm text-muted-foreground truncate">
              {booking.resort_name}
            </p>
          </div>
          <Badge
            variant="outline"
            className={cn(
              'shrink-0 border text-xs capitalize',
              STATUS_STYLES[booking.status] ?? STATUS_STYLES.quote
            )}
          >
            {getStatusLabel(booking.status)}
          </Badge>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span>{formatShortDate(booking.check_in)} – {formatShortDate(booking.check_out)}</span>
        </div>
        <div className="mt-2 font-medium text-foreground">
          {formatCurrency(booking.value, booking.currency)}
          {(booking.balance_due ?? 0) > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">
              (Balance: {formatCurrency(booking.balance_due, booking.currency)})
            </span>
          )}
        </div>

        <div className="mt-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-8"
          >
            <Link to={`/dashboard/bookings/${booking.id}`}>
              <ExternalLink className="h-3.5 w-3.5" />
              Open
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={handleReminder}
          >
            <Bell className="h-3.5 w-3.5" />
            Remind
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={handleInvoice}
          >
            <FileText className="h-3.5 w-3.5" />
            Invoice
          </Button>
        </div>
      </div>
    </Link>
  )
}
