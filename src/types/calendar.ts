/**
 * Calendar types for LuxeFlow CRM
 * Runtime safety: all types support null-safe handling
 */

export type CalendarEventType =
  | 'checkin'
  | 'checkout'
  | 'deadline'
  | 'task'
  | 'room_block'

export type CalendarEventStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'overdue'

export interface CalendarEvent {
  id: string
  type: CalendarEventType
  start_at: string
  end_at: string
  booking_id?: string | null
  room_id?: string | null
  agent_id?: string | null
  resort_id?: string | null
  status: CalendarEventStatus
  title: string
  notes?: string | null
  created_by?: string | null
  updated_by?: string | null
  /** Resolved associations for display */
  booking?: { id: string; reference?: string } | null
  room?: { id: string; number?: string } | null
  agent?: { id: string; name: string } | null
  resort?: { id: string; name: string } | null
}

export interface Room {
  id: string
  number: string
  resort_id: string
  block_status?: string | null
  capacity?: number | null
}

export interface Agent {
  id: string
  name: string
  email?: string | null
  role?: string | null
}

export interface Resort {
  id: string
  name: string
  location?: string | null
  transfer_time?: string | null
}

export interface CalendarFilters {
  agentIds: string[]
  resortIds: string[]
  status: string[]
}

export type ViewMode = 'week' | 'day'

export interface DateRange {
  start: string
  end: string
}

export interface SyncConfig {
  id: string
  user_id: string
  provider: 'google' | 'ical'
  sync_type: 'one-way' | 'two-way'
  last_sync_at?: string | null
  enabled: boolean
  config?: Record<string, unknown> | null
}

export interface CalendarEventsResponse {
  events: CalendarEvent[]
  count?: number
}

export interface DragSettings {
  /** Event types that support drag-to-reschedule */
  reschedulableTypes: CalendarEventType[]
  /** Whether current user can reschedule */
  canReschedule: boolean
}

export type ResourceType = 'room' | 'agent' | 'resort'

export interface DragState {
  eventId: string | null
  event: CalendarEvent | null
  startX: number
  startY: number
  currentSlot: { date: string; hour: number; minute: number } | null
  isValidDrop: boolean
  validationMessage: string | null
}
