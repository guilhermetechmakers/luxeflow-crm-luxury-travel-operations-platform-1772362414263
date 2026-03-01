/**
 * BookingPipeline - Board view with columns per status, cards per booking
 * Click opens BookingDetail; status transitions via card actions
 */
import { useMemo } from 'react'
import { BookingCard } from './booking-card'
import type { BookingSummary, BookingStatus } from '@/types/booking'

const PIPELINE_COLUMNS: { status: BookingStatus; label: string }[] = [
  { status: 'quote', label: 'Quote' },
  { status: 'confirmed', label: 'Confirmed' },
  { status: 'pre_arrival', label: 'Pre-arrival' },
  { status: 'in_stay', label: 'In-stay' },
  { status: 'completed', label: 'Completed' },
]

export interface BookingPipelineProps {
  bookings: BookingSummary[]
  isLoading: boolean
}

export function BookingPipeline({ bookings, isLoading }: BookingPipelineProps) {
  const list = bookings ?? []

  const byStatus = useMemo(() => {
    const map = new Map<BookingStatus, BookingSummary[]>()
    for (const col of PIPELINE_COLUMNS) {
      map.set(col.status, [])
    }
    for (const b of list) {
      const status = b.status ?? 'quote'
      const arr = map.get(status) ?? []
      arr.push(b)
      map.set(status, arr)
    }
    return map
  }, [list])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {PIPELINE_COLUMNS.map((col) => (
          <div key={col.status} className="space-y-3">
            <div className="h-6 w-24 animate-pulse rounded bg-secondary/50" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-lg bg-secondary/50"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {PIPELINE_COLUMNS.map((col) => {
        const cards = byStatus.get(col.status) ?? []
        return (
          <div
            key={col.status}
            className="flex min-w-[280px] max-w-[320px] flex-col rounded-lg border border-border bg-secondary/30 p-3"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {col.label}
              </h3>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {cards.length}
              </span>
            </div>
            <div className="space-y-2">
              {cards.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                  No bookings
                </div>
              ) : (
                cards.map((booking) => (
                  <div key={booking.id} className="group">
                    <BookingCard booking={booking} />
                  </div>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
