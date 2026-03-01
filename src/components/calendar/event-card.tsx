/**
 * EventCard (EventBlock) - Type-based event blocks with drag handle when allowed
 * LuxeFlow palette: olive accent (#8A9A5B), gold (#C6AB62), warm neutrals
 * Variants: CheckIn, CheckOut, Deadline, Task, RoomBlock
 * Accessible: keyboard focus, aria-grabbed, drag affordance
 */
import { useCallback } from 'react'
import { GripVertical, LogIn, LogOut, Clock, CheckSquare, Bed } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatTime } from '@/lib/calendar-utils'
import type { CalendarEvent, CalendarEventType } from '@/types/calendar'

const EVENT_STYLES: Record<
  CalendarEventType,
  { bg: string; border: string; icon: typeof LogIn }
> = {
  checkin: {
    bg: 'bg-[rgb(var(--accent))]/10',
    border: 'border-l-4 border-l-accent',
    icon: LogIn,
  },
  checkout: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-l-4 border-l-amber-500',
    icon: LogOut,
  },
  deadline: {
    bg: 'bg-[rgb(var(--supporting))]/15',
    border: 'border-l-4 border-l-[rgb(var(--supporting))]',
    icon: Clock,
  },
  task: {
    bg: 'bg-secondary/80',
    border: 'border-l-4 border-l-accent',
    icon: CheckSquare,
  },
  room_block: {
    bg: 'bg-accent/5',
    border: 'border-l-4 border-l-accent',
    icon: Bed,
  },
}

export interface EventCardProps {
  event: CalendarEvent
  isDraggable?: boolean
  isDragging?: boolean
  onClick?: (event: CalendarEvent) => void
  onDragStart?: (event: CalendarEvent, e: React.DragEvent) => void
}

export function EventCard({
  event,
  isDraggable = false,
  isDragging = false,
  onClick,
  onDragStart,
}: EventCardProps) {
  const style = EVENT_STYLES[event.type] ?? EVENT_STYLES.task
  const Icon = style.icon

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      if (!isDraggable || !onDragStart) return
      e.dataTransfer.setData('application/json', JSON.stringify({ eventId: event.id, event }))
      e.dataTransfer.effectAllowed = 'move'
      onDragStart(event, e)
    },
    [event, isDraggable, onDragStart]
  )

  return (
    <div
      role="button"
      tabIndex={0}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onClick={() => onClick?.(event)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.(event)
        }
      }}
      className={cn(
        'group relative flex items-start gap-2 rounded-lg px-2 py-1.5 text-left transition-all duration-200',
        'hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        'hover:scale-[1.02] active:scale-[0.98]',
        style.bg,
        style.border,
        isDragging && 'opacity-50 scale-95',
        'cursor-pointer'
      )}
      aria-label={`${event.title} at ${formatTime(event.start_at)}${isDraggable ? '. Drag to reschedule.' : ''}`}
      aria-grabbed={isDraggable && isDragging}
      title={`${event.title} · ${formatTime(event.start_at)}${event.booking?.reference ? ` · ${event.booking.reference}` : ''}`}
    >
      {isDraggable && (
        <div
          className="absolute left-0.5 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-70 transition-opacity"
          aria-hidden
          data-drag-handle
        >
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      )}
      <Icon className="h-3.5 w-3.5 shrink-0 mt-0.5 text-foreground/70" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-foreground">{event.title}</div>
        <div className="text-xs text-muted-foreground">
          {formatTime(event.start_at)}
          {event.end_at && event.end_at !== event.start_at && ` – ${formatTime(event.end_at)}`}
        </div>
        {event.booking?.reference && (
          <div className="text-xs text-muted-foreground truncate">{event.booking.reference}</div>
        )}
      </div>
    </div>
  )
}
