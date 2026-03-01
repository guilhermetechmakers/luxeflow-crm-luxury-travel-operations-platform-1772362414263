/**
 * QuickCreateDialog - Add Task or Room Block
 * LuxeFlow design: olive accent, clean forms
 */
import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckSquare, Bed } from 'lucide-react'
import { toast } from 'sonner'
import type { Resort, Room } from '@/types/calendar'

export type QuickCreateType = 'task' | 'room_block'

export interface QuickCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: QuickCreateType
  dateRange: { start: string; end: string }
  resorts: Resort[]
  rooms: Room[]
  agentId?: string | null
  onCreate: (data: {
    type: QuickCreateType
    title: string
    start_at: string
    end_at: string
    room_id?: string
    resort_id?: string
    agent_id?: string
  }) => Promise<void>
}

export function QuickCreateDialog({
  open,
  onOpenChange,
  type,
  dateRange,
  resorts = [],
  rooms = [],
  agentId,
  onCreate,
}: QuickCreateDialogProps) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(dateRange.start)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [roomId, setRoomId] = useState<string>('')
  const [resortId, setResortId] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const reset = useCallback(() => {
    setTitle('')
    setDate(dateRange.start)
    setStartTime('09:00')
    setEndTime('10:00')
    setRoomId('')
    setResortId('')
  }, [dateRange.start])

  const handleSubmit = useCallback(async () => {
    const trimmed = title?.trim()
    if (!trimmed) {
      toast.error('Please enter a title')
      return
    }
    const [sh, sm] = startTime.split(':').map(Number)
    const [eh, em] = endTime.split(':').map(Number)
    const startAt = new Date(`${date}T${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')}:00`)
    const endAt = new Date(`${date}T${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}:00`)
    if (endAt <= startAt) {
      toast.error('End time must be after start time')
      return
    }
    if (type === 'room_block' && (!roomId || !resortId)) {
      toast.error('Please select a room and resort')
      return
    }
    setIsSubmitting(true)
    try {
      await onCreate({
        type,
        title: trimmed,
        start_at: startAt.toISOString(),
        end_at: endAt.toISOString(),
        ...(type === 'room_block' && roomId && resortId ? { room_id: roomId, resort_id: resortId } : {}),
        ...(agentId ? { agent_id: agentId } : {}),
      })
      toast.success(type === 'task' ? 'Task created' : 'Room block created')
      reset()
      onOpenChange(false)
    } catch {
      toast.error('Failed to create')
    } finally {
      setIsSubmitting(false)
    }
  }, [title, date, startTime, endTime, roomId, resortId, type, agentId, onCreate, reset, onOpenChange])

  const filteredRooms = resortId
    ? (rooms ?? []).filter((r) => r.resort_id === resortId)
    : (rooms ?? [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-serif">
            {type === 'task' ? (
              <>
                <CheckSquare className="h-5 w-5 text-accent" />
                Add Task
              </>
            ) : (
              <>
                <Bed className="h-5 w-5 text-accent" />
                Add Room Block
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === 'task' ? 'e.g. Client call - Villa Serenity' : 'e.g. VIP Block - Room 101'}
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={dateRange.start}
                max={dateRange.end}
                className="mt-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start">Start</Label>
              <Input
                id="start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="end">End</Label>
              <Input
                id="end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          {type === 'room_block' && (
            <>
              <div>
                <Label>Resort</Label>
                <Select value={resortId} onValueChange={(v) => { setResortId(v); setRoomId('') }}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select resort" />
                  </SelectTrigger>
                  <SelectContent>
                    {(resorts ?? []).map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Room</Label>
                <Select value={roomId} onValueChange={setRoomId} disabled={!resortId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredRooms.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
