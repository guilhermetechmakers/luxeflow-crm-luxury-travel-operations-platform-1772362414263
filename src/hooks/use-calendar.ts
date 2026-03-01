/**
 * useCalendar - fetches calendar events with filters
 * Runtime safety: all data validated with Array.isArray and nullish coalescing
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { calendarApi } from '@/api/calendar'
import type { CalendarFilters } from '@/types/calendar'

function getWeekRange(weekOffset: number): { start: string; end: string } {
  const now = new Date()
  const start = new Date(now)
  start.setDate(start.getDate() - start.getDay() + 1 + weekOffset * 7)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  }
}

function getDayRange(weekOffset: number): { start: string; end: string } {
  const now = new Date()
  const d = new Date(now)
  d.setDate(d.getDate() + weekOffset)
  const s = d.toISOString().slice(0, 10)
  return { start: s, end: s }
}

export function useCalendarEvents(
  weekOffset: number,
  filters: CalendarFilters,
  viewMode: 'week' | 'day' = 'week'
) {
  const dateRange =
    viewMode === 'day' ? getDayRange(weekOffset) : getWeekRange(weekOffset)
  const { start, end } = dateRange
  const query = useQuery({
    queryKey: [
      'calendar',
      'events',
      start,
      end,
      filters.agentIds,
      filters.resortIds,
      filters.status,
      filters.searchQuery,
    ],
    queryFn: () =>
      calendarApi.getEvents({
        start,
        end,
        agentIds: (filters.agentIds ?? []).length > 0 ? filters.agentIds : undefined,
        resortIds: (filters.resortIds ?? []).length > 0 ? filters.resortIds : undefined,
        statuses: (filters.status ?? []).length > 0 ? filters.status : undefined,
        searchQuery: filters.searchQuery?.trim() || undefined,
      }),
    staleTime: 60 * 1000,
  })

  const events = Array.isArray(query.data?.events) ? query.data.events : []
  const count = typeof query.data?.count === 'number' ? query.data.count : events.length

  return {
    ...query,
    events,
    count,
    dateRange,
  }
}

export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Record<string, unknown> }) =>
      calendarApi.updateEvent(id, updates as Parameters<typeof calendarApi.updateEvent>[1]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })
}

export function useCalendarSyncStatus() {
  const query = useQuery({
    queryKey: ['calendar', 'sync', 'status'],
    queryFn: () => calendarApi.getSyncStatus(),
    staleTime: 5 * 60 * 1000,
  })

  const syncConfig = query.data ?? null
  return { ...query, syncConfig }
}

export function useCalendarAgents() {
  const query = useQuery({
    queryKey: ['calendar', 'agents'],
    queryFn: () => calendarApi.getAgents(),
    staleTime: 5 * 60 * 1000,
  })
  const agents = Array.isArray(query.data) ? query.data : []
  return { ...query, agents }
}

export function useCalendarResorts() {
  const query = useQuery({
    queryKey: ['calendar', 'resorts'],
    queryFn: () => calendarApi.getResorts(),
    staleTime: 5 * 60 * 1000,
  })
  const resorts = Array.isArray(query.data) ? query.data : []
  return { ...query, resorts }
}
