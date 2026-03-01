/**
 * CalendarWeekView - Main week/day calendar with events, filters, drag
 */
import { useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
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

function getDayKeys(start: string, end: string): string[] {
  const keys: string[] = []
  const d = new Date(start)
  const endDate = new Date(end)
  while (d <= endDate) {
    keys.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    )
    d.setDate(d.getDate() + 1)
  }
  return keys
}

function formatDayHeader(key: string): string {
  const d = new Date(key + 'T12:00:00')
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
}

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
  syncConfig?: { id: string; enabled: boolean; provider: string; sync_type: string } | null
  onSetupSync?: (config: { provider: 'google' | 'ical'; sync_type: 'one-way' | 'two-way' }) => void
  onExportIcal?: () => void
  onMarkComplete?: (event: CalendarEvent) => void
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
              aria-label="Previous week"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onWeekChange(1)}
              aria-label="Next week"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <QuickActionsBar
            syncConfig={syncConfig as any}
            onSetupSync={onSetupSync}
            onExportIcal={onExportIcal}
          />
        </div>
      </div>

      <FilterBar
        agents={agents}
        resorts={resorts}
        filters={filters}
        onFiltersChange={onFiltersChange}
      />

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {dateRange.start} – {dateRange.end}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div
            className="overflow-x-auto overflow-y-auto"
            onDragEnd={onDragEnd}
            style={{ maxHeight: '70vh' }}
          >
            <div className="min-w-[800px] flex">
              <TimeScaleColumn className="shrink-0 w-14" />
              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-7 border-b border-border">
                  {(dayKeys ?? []).map((key) => (
                    <div
                      key={key}
                      className="min-w-[120px] flex-1 p-2 text-center text-sm font-medium border-r border-border last:border-r-0"
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
        </CardContent>
      </Card>

      <EventDetailDialog
        event={popoverEvent}
        open={popoverOpen}
        onOpenChange={setPopoverOpen}
        onOpenBooking={handleOpenBooking}
        onMarkComplete={onMarkComplete}
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
