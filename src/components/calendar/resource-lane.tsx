/**
 * ResourceLane - Lane for rooms/agents/resorts with event blocks
 */
import { useMemo } from 'react'
import { EventCard } from './event-card'
import { cn } from '@/lib/utils'
import type { CalendarEvent } from '@/types/calendar'
import type { DragSettings } from '@/types/calendar'

const PX_PER_HOUR = 48
const SLOTS_PER_HOUR = 2
const MINUTES_PER_SLOT = 30

function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function getSlotOffset(iso: string, dayStart: Date): number {
  const d = new Date(iso)
  const diffMs = d.getTime() - dayStart.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const slotIndex = Math.floor(diffMins / MINUTES_PER_SLOT)
  return Math.max(0, slotIndex) * (PX_PER_HOUR / SLOTS_PER_HOUR)
}

function getSlotHeight(startIso: string, endIso: string): number {
  const start = new Date(startIso)
  const end = new Date(endIso)
  const diffMs = end.getTime() - start.getTime()
  const diffMins = Math.max(MINUTES_PER_SLOT, Math.floor(diffMs / 60000))
  const slots = Math.ceil(diffMins / MINUTES_PER_SLOT)
  return slots * (PX_PER_HOUR / SLOTS_PER_HOUR)
}

export interface ResourceLaneProps {
  resourceId: string
  resourceLabel: string
  resourceType: 'room' | 'agent' | 'resort'
  events: CalendarEvent[]
  dayKeys: string[]
  dragSettings: DragSettings
  draggingEventId: string | null
  onEventClick?: (event: CalendarEvent) => void
  onEventDragStart?: (event: CalendarEvent, e: React.DragEvent) => void
  onSlotDrop?: (slot: { date: string; hour: number; minute: number }, eventId: string) => void
  className?: string
}

export function ResourceLane({
  resourceId,
  resourceLabel,
  resourceType,
  events,
  dayKeys,
  dragSettings,
  draggingEventId,
  onEventClick,
  onEventDragStart,
  onSlotDrop,
  className,
}: ResourceLaneProps) {
  const filteredEvents = useMemo(() => {
    const list = events ?? []
    if (resourceId === '_all') return list
    return list.filter((e) => {
      if (resourceType === 'agent') return e.agent_id === resourceId
      if (resourceType === 'resort') return e.resort_id === resourceId
      return e.room_id === resourceId
    })
  }, [events, resourceId, resourceType])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, dateKey: string, hour: number, minute: number) => {
    e.preventDefault()
    try {
      const raw = e.dataTransfer.getData('application/json')
      const data = raw ? JSON.parse(raw) : null
      const eventId = data?.eventId
      if (eventId && onSlotDrop) {
        onSlotDrop({ date: dateKey, hour, minute }, eventId)
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className={cn('flex flex-col min-h-0', className)}>
      <div className="h-10 shrink-0 flex items-center px-2 border-b border-r border-border font-medium text-sm">
        {resourceLabel}
      </div>
      <div className="flex flex-1" style={{ minHeight: 14 * PX_PER_HOUR }}>
        {(dayKeys ?? []).map((dayKey) => {
          const dayStart = parseDateKey(dayKey)
          dayStart.setHours(7, 0, 0, 0)
          return (
            <div
              key={dayKey}
              className="flex-1 min-w-[120px] relative border-r border-border"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, dayKey, 12, 0)}
            >
              {(filteredEvents ?? []).map((ev) => {
                const evDate = new Date(ev.start_at)
                const evDayKey = `${evDate.getFullYear()}-${String(evDate.getMonth() + 1).padStart(2, '0')}-${String(evDate.getDate()).padStart(2, '0')}`
                if (evDayKey !== dayKey) return null
                const top = getSlotOffset(ev.start_at, dayStart)
                const height = getSlotHeight(ev.start_at, ev.end_at)
                const isDraggable =
                  dragSettings.canReschedule &&
                  (dragSettings.reschedulableTypes ?? []).includes(ev.type)
                return (
                  <div
                    key={ev.id}
                    className="absolute left-1 right-1"
                    style={{ top, height: Math.max(height, 24) }}
                  >
                    <EventCard
                      event={ev}
                      isDraggable={isDraggable}
                      isDragging={draggingEventId === ev.id}
                      onClick={onEventClick}
                      onDragStart={onEventDragStart}
                    />
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
