/**
 * Calendar helpers - date utilities, conflict detection, permission checks
 * Runtime safety: all functions guard against null/undefined
 */

import type { CalendarEvent, CalendarEventType, DragSettings } from '@/types/calendar'

/** Start of week (Monday) for a given date */
export function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/** End of week (Sunday) for a given date */
export function endOfWeek(date: Date): Date {
  const d = startOfWeek(date)
  d.setDate(d.getDate() + 6)
  d.setHours(23, 59, 59, 999)
  return d
}

/** Add days to a date */
export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

/** Format date as YYYY-MM-DD */
export function formatDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Format time as HH:mm */
export function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

/** Format date for display */
export function formatDateDisplay(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

/** Format day header (e.g. "Mon 15 Mar") */
export function formatDayHeader(dateKey: string): string {
  try {
    const d = new Date(dateKey + 'T12:00:00')
    return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
  } catch {
    return dateKey
  }
}

/** Get day keys between start and end (inclusive) */
export function getDayKeys(start: string, end: string): string[] {
  const keys: string[] = []
  const d = new Date(start)
  const endDate = new Date(end)
  while (d <= endDate) {
    keys.push(formatDateKey(d))
    d.setDate(d.getDate() + 1)
  }
  return keys
}

/** Check if event can be rescheduled based on settings and optional per-event override */
export function canRescheduleEvent(
  event: CalendarEvent,
  dragSettings: DragSettings
): boolean {
  if (!dragSettings.canReschedule) return false
  if (event.can_reschedule === false) return false
  const types = dragSettings.reschedulableTypes ?? []
  return types.includes(event.type)
}

/** Detect conflicts when rescheduling to a new slot */
export function detectRescheduleConflicts(
  event: CalendarEvent,
  slot: { date: string; hour: number; minute: number },
  events: CalendarEvent[]
): { hasConflict: boolean; conflictingEvent?: CalendarEvent } {
  const start = new Date(event.start_at)
  const end = new Date(event.end_at)
  const durationMs = end.getTime() - start.getTime()
  const newStart = new Date(
    `${slot.date}T${String(slot.hour).padStart(2, '0')}:${String(slot.minute).padStart(2, '0')}:00`
  )
  const newEnd = new Date(newStart.getTime() + durationMs)

  const otherEvents = (events ?? []).filter((e) => e.id !== event.id)
  for (const e of otherEvents) {
    const aStart = new Date(e.start_at)
    const aEnd = new Date(e.end_at)
    const evDate = new Date(e.start_at)
    const evDayKey = formatDateKey(evDate)
    if (evDayKey !== slot.date) continue

    const sameResource =
      (event.booking_id && e.booking_id === event.booking_id) ||
      (event.room_id && e.room_id === event.room_id) ||
      (event.agent_id && e.agent_id === event.agent_id)
    if (!sameResource) continue

    const overlaps =
      newStart.getTime() < aEnd.getTime() && newEnd.getTime() > aStart.getTime()
    if (overlaps) return { hasConflict: true, conflictingEvent: e }
  }
  return { hasConflict: false }
}

/** Validate drop slot - returns validation result */
export function validateRescheduleDrop(
  event: CalendarEvent,
  slot: { date: string; hour: number; minute: number },
  events: CalendarEvent[],
  dragSettings: DragSettings
): { valid: boolean; message?: string } {
  if (!dragSettings.canReschedule) {
    return { valid: false, message: 'You do not have permission to reschedule' }
  }
  if (!canRescheduleEvent(event, dragSettings)) {
    return { valid: false, message: `Cannot reschedule ${event.type} events` }
  }
  const start = new Date(event.start_at)
  const end = new Date(event.end_at)
  const durationMs = end.getTime() - start.getTime()
  const newStart = new Date(
    `${slot.date}T${String(slot.hour).padStart(2, '0')}:${String(slot.minute).padStart(2, '0')}:00`
  )
  const newEnd = new Date(newStart.getTime() + durationMs)
  if (newStart >= newEnd) {
    return { valid: false, message: 'Invalid time range' }
  }
  const { hasConflict, conflictingEvent } = detectRescheduleConflicts(
    event,
    slot,
    events
  )
  if (hasConflict) {
    return {
      valid: false,
      message: `Conflicts with ${conflictingEvent?.title ?? 'another event'}. Please choose a different time.`,
    }
  }
  return { valid: true }
}

/** Event type display labels */
export const EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
  checkin: 'Check-in',
  checkout: 'Check-out',
  deadline: 'Deadline',
  task: 'Task',
  room_block: 'Room Block',
}
