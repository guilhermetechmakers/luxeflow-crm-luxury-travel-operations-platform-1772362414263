/**
 * DragContext - Handles drag operations with validation
 * Provides drag state and validation to child components
 * Shows ConflictDialog for schedule conflicts per spec
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
import { validateRescheduleDrop } from '@/lib/calendar-utils'
import { ConflictDialog } from './conflict-dialog'
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
  ) => { valid: boolean; message?: string; conflictingEvent?: CalendarEvent }
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
  const [conflictDialog, setConflictDialog] = useState<{
    open: boolean
    message: string
    conflictingEventTitle?: string
  }>({ open: false, message: '' })

  const validateDrop = useCallback(
    (
      event: CalendarEvent,
      slot: { date: string; hour: number; minute: number }
    ) => validateRescheduleDrop(event, slot, events ?? [], dragSettings),
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
        if (result.conflictingEvent) {
          setConflictDialog({
            open: true,
            message: result.message ?? 'This time slot conflicts with another event.',
            conflictingEventTitle: result.conflictingEvent.title,
          })
        } else {
          toast.error(result.message ?? 'Cannot reschedule')
        }
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

  return (
    <DragContext.Provider value={value}>
      {children}
      <ConflictDialog
        open={conflictDialog.open}
        onOpenChange={(open) =>
          setConflictDialog((prev) => ({ ...prev, open }))
        }
        message={conflictDialog.message}
        conflictingEventTitle={conflictDialog.conflictingEventTitle}
      />
    </DragContext.Provider>
  )
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
