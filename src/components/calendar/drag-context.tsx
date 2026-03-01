/**
 * DragContext - Handles drag operations with validation
 * Provides drag state and validation to child components
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { toast } from 'sonner'
import type { CalendarEvent, DragSettings } from '@/types/calendar'

export interface DragContextValue {
  draggingEventId: string | null
  dragState: { event: CalendarEvent | null; isValidDrop: boolean; message: string | null }
  onDragStart: (event: CalendarEvent, e: React.DragEvent) => void
  onDragEnd: () => void
  onSlotDrop: (slot: { date: string; hour: number; minute: number }, eventId: string) => void
  validateDrop: (
    event: CalendarEvent,
    slot: { date: string; hour: number; minute: number }
  ) => { valid: boolean; message?: string }
}

const DragContext = createContext<DragContextValue | null>(null)

export interface DragContextProviderProps {
  children: ReactNode
  dragSettings: DragSettings
  events: CalendarEvent[]
  onReschedule: (
    eventId: string,
    updates: { start_at: string; end_at: string }
  ) => Promise<void>
}

export function DragContextProvider({
  children,
  dragSettings,
  events,
  onReschedule,
}: DragContextProviderProps) {
  const [draggingEventId, setDraggingEventId] = useState<string | null>(null)
  const [dragState, setDragState] = useState<{
    event: CalendarEvent | null
    isValidDrop: boolean
    message: string | null
  }>({ event: null, isValidDrop: true, message: null })

  const validateDrop = useCallback(
    (
      event: CalendarEvent,
      slot: { date: string; hour: number; minute: number }
    ): { valid: boolean; message?: string } => {
      if (!dragSettings.canReschedule) {
        return { valid: false, message: 'You do not have permission to reschedule' }
      }
      const reschedulable = dragSettings.reschedulableTypes ?? []
      if (!reschedulable.includes(event.type)) {
        return { valid: false, message: `Cannot reschedule ${event.type} events` }
      }
      const start = new Date(event.start_at)
      const end = new Date(event.end_at)
      const durationMs = end.getTime() - start.getTime()
      const newStart = new Date(`${slot.date}T${String(slot.hour).padStart(2, '0')}:${String(slot.minute).padStart(2, '0')}:00`)
      const newEnd = new Date(newStart.getTime() + durationMs)
      if (newStart >= newEnd) {
        return { valid: false, message: 'Invalid time range' }
      }
      const otherEvents = (events ?? []).filter((e) => e.id !== event.id)
      const conflicts = otherEvents.filter((e) => {
        const aStart = new Date(e.start_at)
        const aEnd = new Date(e.end_at)
        const sameResource =
          (event.booking_id && e.booking_id === event.booking_id) ||
          (event.room_id && e.room_id === event.room_id) ||
          (event.agent_id && e.agent_id === event.agent_id)
        if (!sameResource) return false
        const evDate = new Date(e.start_at)
        const evDayKey = `${evDate.getFullYear()}-${String(evDate.getMonth() + 1).padStart(2, '0')}-${String(evDate.getDate()).padStart(2, '0')}`
        if (evDayKey !== slot.date) return false
        return newStart.getTime() < aEnd.getTime() && newEnd.getTime() > aStart.getTime()
      })
      if (conflicts.length > 0) {
        return {
          valid: false,
          message: `Conflicts with ${conflicts[0]?.title ?? 'another event'}. Please choose a different time.`,
        }
      }
      return { valid: true }
    },
    [dragSettings, events]
  )

  const onDragStart = useCallback((event: CalendarEvent, _e?: React.DragEvent) => {
    setDraggingEventId(event.id)
    setDragState({ event, isValidDrop: true, message: null })
  }, [])

  const onDragEnd = useCallback(() => {
    setDraggingEventId(null)
    setDragState({ event: null, isValidDrop: true, message: null })
  }, [])

  const onSlotDrop = useCallback(
    async (slot: { date: string; hour: number; minute: number }, eventId: string) => {
      const event = (events ?? []).find((e) => e.id === eventId)
      if (!event) {
        toast.error('Event not found')
        return
      }
      const result = validateDrop(event, slot)
      if (!result.valid) {
        toast.error(result.message ?? 'Cannot reschedule')
        return
      }
      const start = new Date(event.start_at)
      const end = new Date(event.end_at)
      const durationMs = end.getTime() - start.getTime()
      const newStart = new Date(`${slot.date}T${String(slot.hour).padStart(2, '0')}:${String(slot.minute).padStart(2, '0')}:00`)
      const newEnd = new Date(newStart.getTime() + durationMs)
      try {
        await onReschedule(eventId, {
          start_at: newStart.toISOString(),
          end_at: newEnd.toISOString(),
        })
        toast.success('Event rescheduled')
      } catch {
        toast.error('Failed to reschedule')
      } finally {
        setDraggingEventId(null)
        setDragState({ event: null, isValidDrop: true, message: null })
      }
    },
    [events, validateDrop, onReschedule]
  )

  const value = useMemo<DragContextValue>(
    () => ({
      draggingEventId,
      dragState,
      onDragStart,
      onDragEnd,
      onSlotDrop,
      validateDrop,
    }),
    [draggingEventId, dragState, onDragStart, onDragEnd, onSlotDrop, validateDrop]
  )

  return <DragContext.Provider value={value}>{children}</DragContext.Provider>
}

export function useDragContext(): DragContextValue {
  const ctx = useContext(DragContext)
  if (!ctx) {
    return {
      draggingEventId: null,
      dragState: { event: null, isValidDrop: true, message: null },
      onDragStart: () => {},
      onDragEnd: () => {},
      onSlotDrop: () => {},
      validateDrop: () => ({ valid: false, message: 'Drag context not available' }),
    }
  }
  return ctx
}
