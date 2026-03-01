/**
 * BookingDetailLink - Lightweight link to Booking detail page with optional anchor
 */
import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BookingDetailLinkProps {
  bookingId: string
  reference?: string | null
  anchor?: string
  className?: string
  children?: React.ReactNode
}

export function BookingDetailLink({
  bookingId,
  reference,
  anchor,
  className,
  children,
}: BookingDetailLinkProps) {
  const to = anchor ? `/dashboard/bookings/${bookingId}#${anchor}` : `/dashboard/bookings/${bookingId}`
  return (
    <Link
      to={to}
      className={cn(
        'inline-flex items-center gap-1.5 text-accent hover:text-accent/90 hover:underline transition-colors',
        className
      )}
    >
      {children ?? (reference ?? `Booking ${bookingId}`)}
      <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
    </Link>
  )
}
