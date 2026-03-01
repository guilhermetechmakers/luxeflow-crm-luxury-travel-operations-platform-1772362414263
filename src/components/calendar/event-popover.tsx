/**
 * EventPopover - Event detail popover with quick actions
 */
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverAnchor,
} from '@/components/ui/popover'
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

export interface EventPopoverProps {
  event: CalendarEvent
  open: boolean
  onOpenChange: (open: boolean) => void
  anchorRef?: React.RefObject<HTMLElement | null>
  onOpenBooking?: (event: CalendarEvent) => void
  onEditEvent?: (event: CalendarEvent) => void
  onMarkComplete?: (event: CalendarEvent) => void
  children?: React.ReactNode
}

export function EventPopover({
  event,
  open,
  onOpenChange,
  anchorRef,
  onOpenBooking,
  onEditEvent,
  onMarkComplete,
  children,
}: EventPopoverProps) {
  const hasBooking = !!event.booking_id

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      {anchorRef ? (
        <PopoverAnchor asChild>
          <div ref={anchorRef as React.RefObject<HTMLDivElement>} className="contents" />
        </PopoverAnchor>
      ) : (
        <PopoverTrigger asChild>{children}</PopoverTrigger>
      )}
      <PopoverContent
        className="w-80 p-0"
        align="start"
        sideOffset={8}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="p-4 space-y-4">
          <div>
            <h4 className="font-serif font-semibold text-foreground">{event.title}</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {formatDate(event.start_at)} · {formatTime(event.start_at)}
              {event.end_at && event.end_at !== event.start_at && ` – ${formatTime(event.end_at)}`}
            </p>
            <p className="text-xs text-muted-foreground mt-1 capitalize">{event.type.replace('_', ' ')}</p>
            {event.status && (
              <span
                className={cn(
                  'inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium',
                  event.status === 'confirmed' && 'bg-primary/10 text-primary',
                  event.status === 'pending' && 'bg-amber-100 text-amber-800',
                  event.status === 'completed' && 'bg-green-100 text-green-800',
                  event.status === 'overdue' && 'bg-destructive/10 text-destructive'
                )}
              >
                {event.status}
              </span>
            )}
          </div>

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
      </PopoverContent>
    </Popover>
  )
}
