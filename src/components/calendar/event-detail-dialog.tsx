/**
 * EventDetailDialog - Modal event detail with quick actions
 */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Edit3, CheckCircle, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BookingDetailLink } from './booking-detail-link'
import type { CalendarEvent } from '@/types/calendar'

function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

export interface EventDetailDialogProps {
  event: CalendarEvent | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenBooking?: (event: CalendarEvent) => void
  onEditEvent?: (event: CalendarEvent) => void
  onMarkComplete?: (event: CalendarEvent) => void
}

export function EventDetailDialog({
  event,
  open,
  onOpenChange,
  onOpenBooking,
  onEditEvent,
  onMarkComplete,
}: EventDetailDialogProps) {
  if (!event) return null

  const hasBooking = !!event.booking_id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {formatDate(event.start_at)} · {formatTime(event.start_at)}
            {event.end_at && event.end_at !== event.start_at && ` – ${formatTime(event.end_at)}`}
          </p>
          <p className="text-xs text-muted-foreground capitalize">{event.type.replace('_', ' ')}</p>
          {event.status && (
            <span
              className={cn(
                'inline-block px-2 py-0.5 rounded text-xs font-medium',
                event.status === 'confirmed' && 'bg-primary/10 text-primary',
                event.status === 'pending' && 'bg-amber-100 text-amber-800',
                event.status === 'payment_due' && 'bg-amber-100 text-amber-800',
                event.status === 'completed' && 'bg-green-100 text-green-800',
                event.status === 'overdue' && 'bg-destructive/10 text-destructive',
                event.status === 'cancelled' && 'bg-muted text-muted-foreground'
              )}
            >
              {event.status.replace('_', ' ')}
            </span>
          )}

          {hasBooking && event.booking && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Booking</p>
              <BookingDetailLink
                bookingId={event.booking.id}
                reference={event.booking.reference}
                className="text-sm"
              />
            </div>
          )}

          {event.notes && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">{event.notes}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            {hasBooking && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 min-w-[120px]"
                onClick={() => {
                  onOpenBooking?.(event)
                  onOpenChange(false)
                }}
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Open Booking
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="flex-1 min-w-[100px]"
              onClick={() => {
                onEditEvent?.(event)
                onOpenChange(false)
              }}
            >
              <Edit3 className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
            {event.status !== 'completed' && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 min-w-[120px]"
                onClick={() => {
                  onMarkComplete?.(event)
                  onOpenChange(false)
                }}
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                Mark Complete
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
