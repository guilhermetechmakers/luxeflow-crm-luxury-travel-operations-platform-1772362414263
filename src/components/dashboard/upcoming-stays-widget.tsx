import { Link } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatShortDate } from '@/lib/format'
import type { Stay } from '@/types/dashboard'

interface UpcomingStaysWidgetProps {
  stays: Stay[]
  isLoading?: boolean
}

export function UpcomingStaysWidget({ stays = [], isLoading = false }: UpcomingStaysWidgetProps) {
  const items = Array.isArray(stays) ? stays : []

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Stays</CardTitle>
          <CardDescription>Next 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Upcoming Stays</CardTitle>
          <CardDescription>Next 7 days</CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link to="/dashboard/calendar">View all</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground/50" aria-hidden />
            <p className="mt-2 text-sm text-muted-foreground">No upcoming stays</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {(items ?? []).map((s) => (
              <li key={s?.id ?? ''}>
                <Link
                  to={`/dashboard/bookings/${s?.id ?? '#'}`}
                  className="flex items-center gap-4 rounded-lg border border-border p-3 transition-all hover:border-accent/30 hover:shadow-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <Calendar className="h-5 w-5 text-luxe-accent" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{s?.clientName ?? '—'}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {s?.resort ?? '—'} · {s?.roomType ?? '—'}
                    </p>
                  </div>
                  <div className="shrink-0 text-right text-sm">
                    <p>{formatShortDate(s?.checkIn)}</p>
                    <p className="text-muted-foreground">→ {formatShortDate(s?.checkOut)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
