/**
 * CalendarWeekView - Main week/day calendar with events, filters, drag
 * LuxeFlow design: olive accent, clean cards, event type legend
 */
import { useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft, ChevronRight, CalendarDays, LogIn, LogOut, Clock, CheckSquare, Bed } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getDayKeys, formatDayHeader, EVENT_TYPE_LABELS } from '@/lib/calendar-utils'
import { TimeScaleColumn } from './time-scale-column'
import { ResourceLane } from './resource-lane'
import { FilterBar } from './filter-bar'
import { QuickActionsBar } from './quick-actions-bar'
import { EventDetailDialog } from './event-detail-dialog'
import { DragContextProvider, useDragContext } from './drag-context'
import type {
  CalendarEvent,
  CalendarFilters,
  ViewMode,
  DateRange,
  DragSettings,
} from '@/types/calendar'
import type { Agent, Resort } from '@/types/calendar'
import type { CalendarEventType } from '@/types/calendar'

const EVENT_LEGEND_ITEMS: { type: CalendarEventType; icon: typeof LogIn }[] = [
  { type: 'checkin', icon: LogIn },
  { type: 'checkout', icon: LogOut },
  { type: 'deadline', icon: Clock },
  { type: 'task', icon: CheckSquare },
  { type: 'room_block', icon: Bed },
]

export interface CalendarWeekViewProps {
  events: CalendarEvent[]
  agents: Agent[]
  resorts: Resort[]
  filters: CalendarFilters
  onFiltersChange: (f: CalendarFilters) => void
  viewMode: ViewMode
  onViewModeChange?: (m: ViewMode) => void
  dateRange: DateRange
  weekOffset: number
  onWeekChange: (delta: number) => void
  dragSettings: DragSettings
  onReschedule: (
    eventId: string,
    updates: { start_at: string; end_at: string }
  ) => Promise<void>
  syncConfig?: { id: string; enabled: boolean; provider: string; sync_type: string; user_id?: string } | null
  onSetupSync?: (config: { provider: 'google' | 'ical'; sync_type: 'one-way' | 'two-way' }) => void
  onExportIcal?: (bookingIds?: string[]) => void
  onMarkComplete?: (event: CalendarEvent) => void
  onAddTask?: () => void
  onAddRoomBlock?: () => void
  isLoading?: boolean
  className?: string
}

function CalendarWeekViewInner({
  events,
  agents,
  resorts,
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
  dateRange,
  weekOffset: _weekOffset,
  onWeekChange,
  dragSettings,
  onReschedule: _onReschedule,
  syncConfig,
  onSetupSync,
  onExportIcal,
  onMarkComplete,
  onAddTask,
  onAddRoomBlock,
  isLoading = false,
  className,
}: CalendarWeekViewProps) {
  const navigate = useNavigate()
  const [popoverEvent, setPopoverEvent] = useState<CalendarEvent | null>(null)
  const [popoverOpen, setPopoverOpen] = useState(false)

  const { draggingEventId, onDragStart, onDragEnd, onSlotDrop } = useDragContext()

  const dayKeys = useMemo(
    () => getDayKeys(dateRange.start, dateRange.end),
    [dateRange.start, dateRange.end]
  )

  const navLabel =
    viewMode === 'day'
      ? formatDayHeader(dayKeys[0] ?? dateRange.start)
      : `${dateRange.start} – ${dateRange.end}`

  const handleEventClick = useCallback((event: CalendarEvent) => {
    setPopoverEvent(event)
    setPopoverOpen(true)
  }, [])

  const handleOpenBooking = useCallback(
    (event: CalendarEvent) => {
      if (event.booking_id) {
        navigate(`/dashboard/bookings/${event.booking_id}`)
      }
    },
    [navigate]
  )

  const resourceLanes = useMemo(() => {
    const agentIds = new Set<string>()
    ;(events ?? []).forEach((e) => {
      if (e.agent_id) agentIds.add(e.agent_id)
    })
    const lanes = Array.from(agentIds).map((id) => {
      const agent = (agents ?? []).find((a) => a.id === id)
      return { id, label: agent?.name ?? id }
    })
    return lanes.length > 0 ? lanes : [{ id: '_all', label: 'All' }]
  }, [events, agents])

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-foreground">Calendar</h1>
          <p className="mt-1 text-muted-foreground">
            Check-ins, check-outs, and deadlines
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 border border-border rounded-lg p-0.5">
            <Button
              variant={viewMode === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange?.('day')}
            >
              Day
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange?.('week')}
            >
              Week
            </Button>
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onWeekChange(-1)}
              aria-label={viewMode === 'day' ? 'Previous day' : 'Previous week'}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onWeekChange(1)}
              aria-label={viewMode === 'day' ? 'Next day' : 'Next week'}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <QuickActionsBar
            syncConfig={
              syncConfig
                ? {
                    id: syncConfig.id,
                    user_id: syncConfig.user_id ?? 'current',
                    provider: syncConfig.provider as 'google' | 'ical',
                    sync_type: syncConfig.sync_type as 'one-way' | 'two-way',
                    enabled: syncConfig.enabled,
                  }
                : null
            }
            onSetupSync={onSetupSync}
            onExportIcal={() => onExportIcal?.()}
            onAddEvent={onAddTask}
            onAddRoomBlock={onAddRoomBlock}
          />
        </div>
      </div>

      <FilterBar
        agents={agents}
        resorts={resorts}
        filters={filters}
        onFiltersChange={onFiltersChange}
      />

      <Card className="shadow-card overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-muted-foreground font-medium">{navLabel}</span>
            <div
              className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
              role="group"
              aria-label="Event type legend"
            >
              {EVENT_LEGEND_ITEMS.map(({ type, icon: Icon }) => (
                <span
                  key={type}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary/60"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {EVENT_TYPE_LABELS[type]}
                </span>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 sm:p-6 space-y-4 animate-pulse">
              <div className={cn('flex', viewMode === 'day' ? 'min-w-[400px]' : 'min-w-[800px]')}>
                <div className="shrink-0 w-14" />
                <div className="flex-1 min-w-0">
                  <div
                    className={cn(
                      'grid border-b border-border',
                      viewMode === 'day' ? 'grid-cols-1' : 'grid-cols-7'
                    )}
                  >
                    {Array.from({ length: viewMode === 'day' ? 1 : 7 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 min-w-[120px]" />
                    ))}
                  </div>
                  <div className="flex flex-col">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex border-b border-border/50">
                        <Skeleton className="h-10 w-14 shrink-0" />
                        <div className="flex-1 grid grid-cols-7 gap-1 p-2">
                          {Array.from({ length: viewMode === 'day' ? 1 : 7 }).map((_, j) => (
                            <Skeleton key={j} className="h-16 min-w-[100px]" />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (events ?? []).length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 px-6 text-center"
              role="status"
              aria-label="No events"
            >
              <CalendarDays className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
                No events this period
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Try adjusting your filters or selecting a different date range. Check-ins, check-outs, deadlines, tasks, and room blocks will appear here.
              </p>
            </div>
          ) : (
          <div
            className="overflow-x-auto overflow-y-auto -mx-1 px-1 sm:mx-0 sm:px-0"
            onDragEnd={onDragEnd}
            style={{ maxHeight: '70vh' }}
            role="application"
            aria-label="Calendar grid"
          >
            <div
              className={cn(
                'flex min-w-[800px]',
                viewMode === 'day' && 'min-w-[400px]'
              )}
            >
              <TimeScaleColumn className="shrink-0 w-14" />
              <div className="flex-1 min-w-0">
                <div
                  className={cn(
                    'grid border-b border-border sticky top-0 z-10 bg-card',
                    viewMode === 'day' ? 'grid-cols-1' : 'grid-cols-7'
                  )}
                >
                  {(dayKeys ?? []).map((key) => (
                    <div
                      key={key}
                      className={cn(
                        'min-w-[120px] flex-1 p-2 text-center text-sm font-medium border-r border-border',
                        viewMode === 'day' ? 'border-r-0' : 'last:border-r-0'
                      )}
                    >
                      {formatDayHeader(key)}
                    </div>
                  ))}
                </div>
                <div className="flex flex-col">
                  {(resourceLanes.length > 0 ? resourceLanes : [{ id: '_all', label: 'All' }]).map(
                    (lane) => (
                      <ResourceLane
                        key={lane.id}
                        resourceId={lane.id}
                        resourceLabel={lane.label}
                        resourceType="agent"
                        events={events}
                        dayKeys={dayKeys}
                        dragSettings={dragSettings}
                        draggingEventId={draggingEventId}
                        onEventClick={handleEventClick}
                        onEventDragStart={(ev, e) => onDragStart(ev, e)}
                        onSlotDrop={onSlotDrop}
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
          )}
        </CardContent>
      </Card>

      <EventDetailDialog
        event={popoverEvent}
        open={popoverOpen}
        onOpenChange={setPopoverOpen}
        onOpenBooking={handleOpenBooking}
        onMarkComplete={onMarkComplete}
        onExportIcal={onExportIcal}
      />
    </div>
  )
}

export function CalendarWeekView(props: CalendarWeekViewProps) {
  return (
    <DragContextProvider
      dragSettings={props.dragSettings}
      events={props.events}
      onReschedule={props.onReschedule}
    >
      <CalendarWeekViewInner {...props} />
    </DragContextProvider>
  )
}
