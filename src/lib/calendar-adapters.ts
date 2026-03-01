/**
 * Calendar data adapters - Normalize API results to consistent arrays
 * Runtime safety: all functions guard against null/undefined
 */

import type { CalendarEvent, CalendarEventType, CalendarEventStatus } from '@/types/calendar'

/** Normalize raw API response to CalendarEventsResponse shape */
export function normalizeEventsResponse(raw: unknown): { events: CalendarEvent[]; count: number } {
  const data = raw as Partial<{ events?: unknown[]; count?: number }> | null | undefined
  const rawEvents = Array.isArray(data?.events) ? data.events : []
  const events = mapToCalendarEvents(rawEvents)
  const count = typeof data?.count === 'number' ? data.count : events.length
  return { events, count }
}

/** Ensure event has required fields, fill defaults */
export function normalizeCalendarEvent(raw: unknown): CalendarEvent | null {
  const e = raw as Partial<CalendarEvent> | null | undefined
  if (!e?.id || !e?.type || !e?.start_at || !e?.title) return null
  return {
    id: e.id,
    type: e.type as CalendarEventType,
    start_at: e.start_at,
    end_at: e.end_at ?? e.start_at,
    booking_id: e.booking_id ?? null,
    room_id: e.room_id ?? null,
    agent_id: e.agent_id ?? null,
    resort_id: e.resort_id ?? null,
    status: (e.status ?? 'pending') as CalendarEventStatus,
    title: e.title,
    notes: e.notes ?? null,
    can_reschedule: e.can_reschedule ?? undefined,
    booking: e.booking ?? null,
    room: e.room ?? null,
    agent: e.agent ?? null,
    resort: e.resort ?? null,
  }
}

/** Map array of raw events to normalized CalendarEvent[] */
export function mapToCalendarEvents(raw: unknown[]): CalendarEvent[] {
  const list = raw ?? []
  return list
    .map((item) => normalizeCalendarEvent(item))
    .filter((e): e is CalendarEvent => e !== null)
}
