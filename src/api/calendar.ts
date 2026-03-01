/**
 * Calendar API - events, rooms, agents, resorts, sync, iCal export
 * Uses mock data for local development; swap for Supabase/Edge Function in production
 * Runtime safety: all responses validated with nullish coalescing and Array.isArray checks
 */
import { api } from '@/lib/api'
import type {
  CalendarEvent,
  CalendarEventsResponse,
  Room,
  Agent,
  Resort,
  SyncConfig,
} from '@/types/calendar'
import type { Agent as BookingAgent } from '@/types/booking'
import { bookingsApi } from '@/api/bookings'
import { resortsApi } from '@/api/resorts'

const MOCK_AGENTS: Agent[] = [
  { id: 'a1', name: 'Sarah Mitchell', email: 'sarah@luxeflow.com' },
  { id: 'a2', name: 'James Chen', email: 'james@luxeflow.com' },
  { id: 'a3', name: 'Emma Laurent', email: 'emma@luxeflow.com' },
]

const MOCK_RESORTS: Resort[] = [
  { id: 'r1', name: 'Villa Serenity', location: 'Amalfi Coast' },
  { id: 'r2', name: 'Ocean View Resort', location: 'Santorini' },
  { id: 'r3', name: 'Mountain Lodge', location: 'Swiss Alps' },
  { id: 'r4', name: 'Château des Alpes', location: 'France' },
  { id: 'r5', name: 'Palazzo Riviera', location: 'Italy' },
]

const MOCK_ROOMS: Room[] = [
  { id: 'rm1', number: '101', resort_id: 'r1' },
  { id: 'rm2', number: '102', resort_id: 'r1' },
  { id: 'rm3', number: '201', resort_id: 'r2' },
  { id: 'rm4', number: '301', resort_id: 'r3' },
]

function buildMockEvents(start: string, end: string): CalendarEvent[] {
  const events: CalendarEvent[] = []
  const startDate = new Date(start + 'T00:00:00')
  const endDate = new Date(end + 'T23:59:59')
  const rangeMs = endDate.getTime() - startDate.getTime()
  const dayMs = 24 * 60 * 60 * 1000

  // Bookings with dates relative to range (day 0, 1, 2, etc. from start)
  const bookings = [
    { id: 'b1', ref: 'LF-2025-001', dayOffset: 0, resort: 'r1', agent: 'a1', status: 'confirmed' as const },
    { id: 'b2', ref: 'LF-2025-002', dayOffset: 2, resort: 'r2', agent: 'a2', status: 'quote' as const },
    { id: 'b3', ref: 'LF-2025-003', dayOffset: 1, resort: 'r3', agent: 'a1', status: 'pre_arrival' as const },
    { id: 'b4', ref: 'LF-2025-004', dayOffset: 3, resort: 'r4', agent: 'a2', status: 'in_stay' as const },
  ]

  for (const b of bookings) {
    const checkInDate = new Date(startDate.getTime() + b.dayOffset * dayMs)
    const checkOutDate = new Date(startDate.getTime() + (b.dayOffset + 7) * dayMs)
    const ci = new Date(checkInDate)
    ci.setHours(14, 0, 0, 0)
    const co = new Date(checkOutDate)
    co.setHours(11, 0, 0, 0)
    if (ci >= startDate && ci <= endDate) {
      events.push({
        id: `ev-checkin-${b.id}`,
        type: 'checkin',
        start_at: ci.toISOString(),
        end_at: new Date(ci.getTime() + 30 * 60 * 1000).toISOString(),
        booking_id: b.id,
        resort_id: b.resort,
        agent_id: b.agent,
        status: 'confirmed',
        title: `Check-in: ${b.ref}`,
        booking: { id: b.id, reference: b.ref },
        resort: MOCK_RESORTS.find((r) => r.id === b.resort) ?? undefined,
        agent: MOCK_AGENTS.find((a) => a.id === b.agent) ?? undefined,
      })
    }
    if (co >= startDate && co <= endDate) {
      events.push({
        id: `ev-checkout-${b.id}`,
        type: 'checkout',
        start_at: co.toISOString(),
        end_at: new Date(co.getTime() + 30 * 60 * 1000).toISOString(),
        booking_id: b.id,
        resort_id: b.resort,
        agent_id: b.agent,
        status: 'confirmed',
        title: `Check-out: ${b.ref}`,
        booking: { id: b.id, reference: b.ref },
        resort: MOCK_RESORTS.find((r) => r.id === b.resort) ?? undefined,
        agent: MOCK_AGENTS.find((a) => a.id === b.agent) ?? undefined,
      })
    }
    const payDueDate = new Date(startDate.getTime() + b.dayOffset * dayMs)
    payDueDate.setHours(17, 0, 0, 0)
    if (payDueDate >= startDate && payDueDate <= endDate && b.id === 'b3') {
      events.push({
        id: `ev-deadline-${b.id}-pay`,
        type: 'deadline',
        start_at: payDueDate.toISOString(),
        end_at: payDueDate.toISOString(),
        booking_id: b.id,
        agent_id: b.agent,
        status: 'pending',
        title: 'Payment due',
        booking: { id: b.id, reference: b.ref },
        agent: MOCK_AGENTS.find((a) => a.id === b.agent) ?? undefined,
      })
    }
  }

  const taskDayOffset = Math.min(2, Math.max(0, Math.floor(rangeMs / dayMs) - 1))
  const taskDate = new Date(startDate.getTime() + taskDayOffset * dayMs)
  taskDate.setHours(9, 0, 0, 0)
  const taskEnd = new Date(taskDate.getTime() + 60 * 60 * 1000)
  events.push({
    id: 'ev-task-1',
    type: 'task',
    start_at: taskDate.toISOString(),
    end_at: taskEnd.toISOString(),
    agent_id: 'a1',
    status: 'pending',
    title: 'Client call - Villa Serenity',
    agent: MOCK_AGENTS[0],
  })

  const blockDayOffset = Math.min(1, Math.max(0, Math.floor(rangeMs / dayMs) - 2))
  const blockStart = new Date(startDate.getTime() + blockDayOffset * dayMs)
  blockStart.setHours(14, 0, 0, 0)
  const blockEnd = new Date(blockStart.getTime() + 2 * dayMs)
  blockEnd.setHours(11, 0, 0, 0)
  events.push({
    id: 'ev-room-1',
    type: 'room_block',
    start_at: blockStart.toISOString(),
    end_at: blockEnd.toISOString(),
    room_id: 'rm1',
    resort_id: 'r1',
    status: 'confirmed',
    title: 'VIP Block - Room 101',
    room: MOCK_ROOMS[0],
    resort: MOCK_RESORTS[0],
  })

  return events
}

function normalizeEventsResponse(raw: unknown): CalendarEventsResponse {
  const data = raw as Partial<CalendarEventsResponse> | null | undefined
  const events = Array.isArray(data?.events) ? data.events : []
  const count = typeof data?.count === 'number' ? data.count : events.length
  return { events, count }
}

export const calendarApi = {
  /**
   * GET /api/calendar/events?start=&end=&agentIds=&resortIds=&statuses=
   */
  async getEvents(params: {
    start: string
    end: string
    agentIds?: string[]
    resortIds?: string[]
    statuses?: string[]
    searchQuery?: string
  }): Promise<CalendarEventsResponse> {
    try {
      const search = new URLSearchParams()
      search.set('start', params.start)
      search.set('end', params.end)
      if (params.agentIds?.length) search.set('agentIds', params.agentIds.join(','))
      if (params.resortIds?.length) search.set('resortIds', params.resortIds.join(','))
      if (params.statuses?.length) search.set('statuses', params.statuses.join(','))
      if (params.searchQuery?.trim()) search.set('q', params.searchQuery.trim())
      const res = await api.get<CalendarEventsResponse>(`/calendar/events?${search.toString()}`)
      return normalizeEventsResponse(res)
    } catch {
      let events = buildMockEvents(params.start, params.end)
      if (params.agentIds?.length) {
        events = events.filter((e) => e.agent_id && params.agentIds!.includes(e.agent_id))
      }
      if (params.resortIds?.length) {
        events = events.filter((e) => e.resort_id && params.resortIds!.includes(e.resort_id))
      }
      if (params.statuses?.length) {
        events = events.filter((e) => params.statuses!.includes(e.status))
      }
      if (params.searchQuery?.trim()) {
        const q = params.searchQuery.trim().toLowerCase()
        events = events.filter(
          (e) =>
            e.title?.toLowerCase().includes(q) ||
            e.booking?.reference?.toLowerCase().includes(q)
        )
      }
      return { events, count: events.length }
    }
  },

  /**
   * GET /api/bookings/:id
   */
  async getBooking(id: string) {
    return bookingsApi.getBookingDetail(id)
  },

  /**
   * GET /api/agents
   */
  async getAgents(): Promise<Agent[]> {
    try {
      const res = await bookingsApi.getAgents()
      return (res ?? []).map((a: BookingAgent) => ({ id: a.id, name: a.name }))
    } catch {
      return MOCK_AGENTS
    }
  },

  /**
   * GET /api/resorts
   */
  async getResorts(): Promise<Resort[]> {
    try {
      const list = await resortsApi.searchResorts({})
      return (list ?? []).map((r) => ({ id: r.id, name: r.name, location: r.location }))
    } catch {
      return MOCK_RESORTS
    }
  },

  /**
   * GET /api/rooms
   */
  async getRooms(): Promise<Room[]> {
    try {
      const res = await api.get<Room[] | { data?: Room[] }>('/rooms')
      const list = Array.isArray(res) ? res : Array.isArray((res as { data?: Room[] })?.data) ? (res as { data: Room[] }).data : []
      return list ?? MOCK_ROOMS
    } catch {
      return MOCK_ROOMS
    }
  },

  /**
   * POST /api/calendar/events
   */
  async createEvent(data: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
    try {
      const res = await api.post<CalendarEvent>('/calendar/events', data)
      return res ?? null
    } catch {
      return {
        id: `ev-${Date.now()}`,
        type: (data.type ?? 'task') as CalendarEvent['type'],
        start_at: data.start_at ?? new Date().toISOString(),
        end_at: data.end_at ?? new Date().toISOString(),
        status: 'pending',
        title: data.title ?? 'New event',
        ...data,
      }
    }
  },

  /**
   * PATCH /api/calendar/events/:id
   */
  async updateEvent(id: string, updates: Partial<Pick<CalendarEvent, 'start_at' | 'end_at' | 'status' | 'title' | 'notes'>>): Promise<CalendarEvent | null> {
    try {
      const res = await api.patch<CalendarEvent>(`/calendar/events/${id}`, updates)
      return res ?? null
    } catch {
      return null
    }
  },

  /**
   * POST /api/calendar/reschedule
   * Reschedule event to new time slot (validates permissions and conflicts server-side)
   */
  async rescheduleEvent(eventId: string, newStartTime: string, newEndTime?: string): Promise<CalendarEvent | null> {
    try {
      const res = await api.post<CalendarEvent>('/calendar/reschedule', {
        eventId,
        newStartTime,
        newEndTime,
      })
      return res ?? null
    } catch {
      return this.updateEvent(eventId, {
        start_at: newStartTime,
        end_at: newEndTime ?? newStartTime,
      })
    }
  },

  /**
   * DELETE /api/calendar/events/:id
   */
  async deleteEvent(id: string): Promise<boolean> {
    try {
      await api.delete(`/calendar/events/${id}`)
      return true
    } catch {
      return false
    }
  },

  /**
   * GET /api/calendar/sync/status
   */
  async getSyncStatus(): Promise<SyncConfig | null> {
    try {
      const res = await api.get<SyncConfig | { data?: SyncConfig }>('/calendar/sync/status')
      const cfg = (res as SyncConfig)?.id ? (res as SyncConfig) : (res as { data?: SyncConfig })?.data
      return cfg ?? null
    } catch {
      return null
    }
  },

  /**
   * POST /api/calendar/sync/setup
   */
  async setupSync(config: { provider: 'google' | 'ical'; sync_type: 'one-way' | 'two-way' }): Promise<SyncConfig | null> {
    try {
      const res = await api.post<SyncConfig>('/calendar/sync/setup', config)
      return res ?? null
    } catch {
      return {
        id: `sync-${Date.now()}`,
        user_id: 'current',
        provider: config.provider,
        sync_type: config.sync_type,
        enabled: true,
        last_sync_at: new Date().toISOString(),
      }
    }
  },

  /**
   * GET /api/ical/export?start=&end=&bookingIds=
   * Exports current view (start/end) or selected bookings
   */
  getIcalExportUrl(params: {
    start?: string
    end?: string
    bookingIds?: string[]
  }): string {
    const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
    const search = new URLSearchParams()
    if (params.start) search.set('start', params.start)
    if (params.end) search.set('end', params.end)
    if (params.bookingIds?.length) {
      params.bookingIds.forEach((id) => search.append('bookingIds', id))
    }
    const qs = search.toString()
    return `${base}/ical/export${qs ? `?${qs}` : ''}`
  },
}
