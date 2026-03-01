/**
 * TravelHistoryPanel - Past trips with links to bookings, attach notes/documents
 */
import { Link } from 'react-router-dom'
import { MapPin, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatShortDate } from '@/lib/format'
import type { TravelHistoryItem } from '@/types/client-detail'

export interface TravelHistoryPanelProps {
  travelHistory: TravelHistoryItem[]
  bookings: { id: string; resortName?: string; checkIn?: string; checkOut?: string; status: string }[]
  isLoading?: boolean
}

export function TravelHistoryPanel({
  travelHistory,
  bookings,
  isLoading = false,
}: TravelHistoryPanelProps) {
  const history = travelHistory ?? []
  const bookingList = bookings ?? []

  const pastBookings = bookingList.filter(
    (b) => b.status === 'completed' || (b.checkOut && new Date(b.checkOut) < new Date())
  )

  const items = history.length > 0 ? history : pastBookings.map((b) => ({
    id: b.id,
    bookingId: b.id,
    resortName: b.resortName,
    checkIn: b.checkIn,
    checkOut: b.checkOut,
    summary: `${b.resortName ?? 'Resort'} • ${formatShortDate(b.checkIn)} – ${formatShortDate(b.checkOut)}`,
  }))

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Travel History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
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
      <CardHeader>
        <CardTitle>Travel History</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No past trips</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 rounded-lg border border-border p-4 transition-colors hover:bg-secondary/30 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{item.resortName ?? 'Resort'}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatShortDate(item.checkIn)} – {formatShortDate(item.checkOut)}
                  </p>
                  {item.summary && (
                    <p className="mt-1 text-sm">{item.summary}</p>
                  )}
                </div>
                {item.bookingId && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/dashboard/bookings/${item.bookingId}`}>
                      <ExternalLink className="h-4 w-4" />
                      View booking
                    </Link>
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
