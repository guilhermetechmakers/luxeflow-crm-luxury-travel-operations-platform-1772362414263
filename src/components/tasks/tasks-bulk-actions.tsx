/**
 * TasksBulkActions - Bulk assign, due date, reminders for selected tasks
 */
import { useState } from 'react'
import { UserPlus, Calendar, Bell, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAgentsForTasks } from '@/hooks/use-tasks'
import { cn } from '@/lib/utils'

export interface TasksBulkActionsProps {
  selectedCount: number
  onBulkAssign: (assigneeId: string) => void
  onBulkDueDate: (dueDate: string) => void
  onBulkRemind: () => void
  onClearSelection: () => void
  isUpdating?: boolean
}

export function TasksBulkActions({
  selectedCount,
  onBulkAssign,
  onBulkDueDate,
  onBulkRemind,
  onClearSelection,
  isUpdating,
}: TasksBulkActionsProps) {
  const { agents } = useAgentsForTasks()
  const [assigneeId, setAssigneeId] = useState<string>('')
  const [dueDate, setDueDate] = useState<string>('')

  if (selectedCount === 0) return null

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 rounded-lg border border-accent/30 bg-accent/5 px-4 py-3',
        'animate-fade-in'
      )}
    >
      <span className="text-sm font-medium text-foreground">
        {selectedCount} selected
      </span>

      <Select
        value={assigneeId || 'placeholder'}
        onValueChange={setAssigneeId}
        disabled={isUpdating}
      >
        <SelectTrigger className="h-8 w-[160px]" aria-label="Bulk assign">
          <SelectValue placeholder="Assign to..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="placeholder" disabled>
            Assign to...
          </SelectItem>
          {(agents ?? []).map((a) => (
            <SelectItem key={a.id} value={a.id}>
              {a.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          if (assigneeId) {
            onBulkAssign(assigneeId)
            setAssigneeId('')
          }
        }}
        disabled={!assigneeId || isUpdating}
        aria-label="Apply assignee"
      >
        <UserPlus className="mr-1 h-4 w-4" />
        Assign
      </Button>

      <Input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="h-8 w-[140px]"
        disabled={isUpdating}
        aria-label="Bulk due date"
      />
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          if (dueDate) {
            onBulkDueDate(dueDate)
            setDueDate('')
          }
        }}
        disabled={!dueDate || isUpdating}
        aria-label="Apply due date"
      >
        <Calendar className="mr-1 h-4 w-4" />
        Due Date
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={onBulkRemind}
        disabled={isUpdating}
        aria-label="Send reminders"
      >
        <Bell className="mr-1 h-4 w-4" />
        Remind
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={onClearSelection}
        disabled={isUpdating}
        aria-label="Clear selection"
      >
        <X className="mr-1 h-4 w-4" />
        Clear
      </Button>
    </div>
  )
}
