/**
 * Calendar / Week View - Check-ins, check-outs, deadlines, tasks, room blocks
 */
import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { CalendarWeekView } from '@/components/calendar'
import {
  useCalendarEvents,
  useUpdateCalendarEvent,
  useCalendarSyncStatus,
  useCalendarAgents,
  useCalendarResorts,
} from '@/hooks/use-calendar'
import { calendarApi } from '@/api/calendar'
import type { CalendarFilters, ViewMode, DragSettings } from '@/types/calendar'

const DEFAULT_DRAG_SETTINGS: DragSettings = {
  reschedulableTypes: ['checkin', 'checkout', 'task', 'room_block'],
  canReschedule: true,
}

export function Calendar() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [filters, setFilters] = useState<CalendarFilters>({
    agentIds: [],
    resortIds: [],
    status: [],
  })

  const { events, dateRange } = useCalendarEvents(weekOffset, filters, viewMode)
  const { agents } = useCalendarAgents()
  const { resorts } = useCalendarResorts()
  const { syncConfig } = useCalendarSyncStatus()
  const updateEvent = useUpdateCalendarEvent()

  const handleReschedule = useCallback(
    async (eventId: string, updates: { start_at: string; end_at: string }) => {
      await updateEvent.mutateAsync({
        id: eventId,
        updates: { start_at: updates.start_at, end_at: updates.end_at },
      })
    },
    [updateEvent]
  )

  const handleSetupSync = useCallback(
    async (config: { provider: 'google' | 'ical'; sync_type: 'one-way' | 'two-way' }) => {
      try {
        await calendarApi.setupSync(config)
        toast.success('Calendar sync configured')
      } catch {
        toast.error('Failed to setup sync')
      }
    },
    []
  )

  const handleExportIcal = useCallback(() => {
    const url = calendarApi.getIcalExportUrl('')
    if (url) {
      window.open(url, '_blank')
      toast.success('iCal export started')
    } else {
      toast.error('Export not available')
    }
  }, [])

  const handleMarkComplete = useCallback(
    async (event: { id: string }) => {
      try {
        await updateEvent.mutateAsync({
          id: event.id,
          updates: { status: 'completed' },
        })
        toast.success('Event marked complete')
      } catch {
        toast.error('Failed to update event')
      }
    },
    [updateEvent]
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <CalendarWeekView
        events={events}
        agents={agents}
        resorts={resorts}
        filters={filters}
        onFiltersChange={setFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        dateRange={dateRange}
        weekOffset={weekOffset}
        onWeekChange={(delta) => setWeekOffset((o) => o + delta)}
        dragSettings={DEFAULT_DRAG_SETTINGS}
        onReschedule={handleReschedule}
        syncConfig={syncConfig}
        onSetupSync={handleSetupSync}
        onExportIcal={handleExportIcal}
        onMarkComplete={handleMarkComplete}
      />
    </div>
  )
}
