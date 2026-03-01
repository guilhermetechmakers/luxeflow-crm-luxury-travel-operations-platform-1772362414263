/**
 * Calendar / Week View - Check-ins, check-outs, deadlines, tasks, room blocks
 */
import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { CalendarWeekView, QuickCreateDialog } from '@/components/calendar'
import {
  useCalendarEvents,
  useUpdateCalendarEvent,
  useCreateCalendarEvent,
  useCalendarSyncStatus,
  useCalendarAgents,
  useCalendarResorts,
  useCalendarRooms,
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
  const [quickCreateOpen, setQuickCreateOpen] = useState(false)
  const [quickCreateType, setQuickCreateType] = useState<'task' | 'room_block'>('task')

  const { events, dateRange, isLoading } = useCalendarEvents(
    weekOffset,
    filters,
    viewMode
  )
  const { agents } = useCalendarAgents()
  const { resorts } = useCalendarResorts()
  const { rooms } = useCalendarRooms()
  const { syncConfig } = useCalendarSyncStatus()
  const updateEvent = useUpdateCalendarEvent()
  const createEvent = useCreateCalendarEvent()

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

  const handleExportIcal = useCallback(
    (bookingIds?: string[]) => {
      const url = calendarApi.getIcalExportUrl({
        start: dateRange.start,
        end: dateRange.end,
        bookingIds,
      })
      if (url) {
        window.open(url, '_blank')
        toast.success('iCal export started')
      } else {
        toast.error('Export not available')
      }
    },
    [dateRange.start, dateRange.end]
  )

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

  const handleQuickCreate = useCallback(
    async (data: {
      type: 'task' | 'room_block'
      title: string
      start_at: string
      end_at: string
      room_id?: string
      resort_id?: string
      agent_id?: string
    }) => {
      await createEvent.mutateAsync(data)
    },
    [createEvent]
  )

  const openQuickCreate = useCallback((type: 'task' | 'room_block') => {
    setQuickCreateType(type)
    setQuickCreateOpen(true)
  }, [])

  return (
    <div className="space-y-6 animate-fade-in">
      <QuickCreateDialog
        open={quickCreateOpen}
        onOpenChange={setQuickCreateOpen}
        type={quickCreateType}
        dateRange={dateRange}
        resorts={resorts}
        rooms={rooms}
        onCreate={handleQuickCreate}
      />
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
        onAddTask={() => openQuickCreate('task')}
        onAddRoomBlock={() => openQuickCreate('room_block')}
        isLoading={isLoading}
      />
    </div>
  )
}
