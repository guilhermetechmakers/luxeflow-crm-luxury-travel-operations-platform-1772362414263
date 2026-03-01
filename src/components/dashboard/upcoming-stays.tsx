/**
 * Upcoming Stays widget - compact list with dates, client, resort, room type
 */
import { Link } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Stay } from '@/types/dashboard'

interface UpcomingStaysProps {
  stays: Stay[]
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })

export function UpcomingStays({ stays = [] }: UpcomingStaysProps) {
  const items = Array.isArray(stays) ? stays : []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Stays</CardTitle>
        <CardDescription>Check-ins within the next 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground/50" aria-hidden />
            <p className="mt-2 text-sm text-muted-foreground">No upcoming stays</p>
            <p className="text-xs text-muted-foreground">Stays will appear here when scheduled</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.slice(0, 5).map((stay) => (
              <li key={stay.id}>
                <Link
                  to={`/dashboard/bookings/${stay.id}`}
                  className="block rounded-lg border border-border p-3 transition-all duration-200 hover:border-accent/30 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{stay.clientName ?? 'Client'}</p>
                      <p className="text-sm text-muted-foreground">{stay.resort ?? 'Resort'}</p>
                      {stay.roomType && (
                        <p className="text-xs text-muted-foreground">{stay.roomType}</p>
                      )}
                    </div>
                    <div className="text-right text-sm">
                      <p>{formatDate(stay.checkIn)} → {formatDate(stay.checkOut)}</p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {items.length > 5 && (
          <Link
            to="/dashboard/calendar"
            className="mt-4 block text-center text-sm font-medium text-accent hover:underline"
          >
            View all ({items.length})
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
