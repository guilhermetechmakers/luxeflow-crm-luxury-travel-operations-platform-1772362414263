/**
 * BookingsPanel - Linked bookings with open detail, create new booking
 */
import { Link } from 'react-router-dom'
import { CalendarPlus, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatShortDate } from '@/lib/format'
import type { BookingSummary } from '@/types/client-detail'

export interface BookingsPanelProps {
  clientId: string
  bookings: BookingSummary[]
  isLoading?: boolean
}

export function BookingsPanel({
  clientId,
  bookings,
  isLoading = false,
}: BookingsPanelProps) {
  const list = bookings ?? []

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-lg bg-secondary/50"
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Bookings</CardTitle>
        <Button asChild size="sm">
          <Link to={`/dashboard/bookings/new?client=${clientId}`}>
            <CalendarPlus className="h-4 w-4" />
            New Booking
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
            <p className="text-muted-foreground">No bookings yet</p>
            <Button asChild className="mt-4">
              <Link to={`/dashboard/bookings/new?client=${clientId}`}>
                Create first booking
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((b) => (
              <div
                key={b.id}
                className="flex flex-col gap-2 rounded-lg border border-border p-4 transition-colors hover:bg-secondary/30 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{b.resortName ?? 'Resort'}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatShortDate(b.checkIn)} – {formatShortDate(b.checkOut)}
                  </p>
                  <div className="mt-1">
                    <Badge variant="secondary" className="capitalize">
                      {b.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {b.price != null && (
                    <span className="font-medium">
                      {formatCurrency(b.price, b.currency)}
                    </span>
                  )}
                  <Button variant="ghost" size="icon" asChild aria-label="View booking">
                    <Link to={`/dashboard/bookings/${b.id}`}>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
