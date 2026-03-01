/**
 * TasksList - Sortable flat list with row actions
 * Sticky headers, sortable columns, responsive cards on mobile
 */
import { Link } from 'react-router-dom'
import { Bell, MessageSquare, AlertTriangle, MoreHorizontal } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { Task } from '@/types/task'

const STATUS_LABELS: Record<Task['status'], string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  blocked: 'Blocked',
  done: 'Done',
}

export interface TasksListProps {
  tasks: Task[]
  sortField?: string
  sortOrder?: 'asc' | 'desc'
  onSort?: (field: string) => void
  onTaskClick?: (task: Task) => void
  onRemind?: (taskId: string) => void
  onComment?: (taskId: string) => void
  onEscalate?: (taskId: string) => void
  selectedTaskIds?: string[]
  onSelect?: (taskId: string, selected: boolean) => void
  onSelectAll?: (selected: boolean) => void
  isLoading?: boolean
}

export function TasksList({
  tasks,
  sortField,
  sortOrder,
  onSort,
  onTaskClick,
  onRemind,
  onComment,
  onEscalate,
  selectedTaskIds = [],
  onSelect,
  onSelectAll,
  isLoading,
}: TasksListProps) {
  const list = tasks ?? []
  const allSelected =
    list.length > 0 && list.every((t) => selectedTaskIds.includes(t.id))
  const someSelected = selectedTaskIds.length > 0

  const SortHeader = ({
    field,
    label,
  }: {
    field: string
    label: string
  }) => (
    <TableHead>
      <button
        type="button"
        onClick={() => onSort?.(field)}
        className={cn(
          'flex items-center gap-1 font-medium hover:text-accent',
          sortField === field && 'text-accent'
        )}
      >
        {label}
        {sortField === field && (
          <span className="text-xs">{sortOrder === 'desc' ? '↓' : '↑'}</span>
        )}
      </button>
    </TableHead>
  )

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {onSelectAll && (
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected && !allSelected
                    }}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    aria-label="Select all tasks"
                  />
                </TableHead>
              )}
              <TableHead>Task</TableHead>
              <SortHeader field="dueDate" label="Due Date" />
              <SortHeader field="priority" label="Priority" />
              <SortHeader field="assignee" label="Assignee" />
              <TableHead>Booking</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={8}>
                    <Skeleton className="h-12 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : list.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-12 text-center text-muted-foreground"
                >
                  No tasks match your filters
                </TableCell>
              </TableRow>
            ) : (
              list.map((task) => {
                const initials = (task.assigneeName ?? '?')
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()
                const isOverdue =
                  task.dueDate &&
                  new Date(task.dueDate) < new Date() &&
                  task.status !== 'done'

                return (
                  <TableRow
                    key={task.id}
                    className={cn(
                      'cursor-pointer transition-colors hover:bg-secondary/50',
                      selectedTaskIds.includes(task.id) && 'bg-accent/10'
                    )}
                    onClick={() => onTaskClick?.(task)}
                  >
                    {onSelectAll && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedTaskIds.includes(task.id)}
                          onChange={(e) =>
                            onSelect?.(task.id, e.target.checked)
                          }
                          aria-label={`Select ${task.title}`}
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <div>
                        <p className="font-medium">{task.title}</p>
                        {task.slaLabel && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {task.slaLabel}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          isOverdue && 'font-medium text-destructive'
                        )}
                      >
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString()
                          : '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          task.priority === 'urgent'
                            ? 'destructive'
                            : task.priority === 'high'
                              ? 'default'
                              : 'secondary'
                        }
                      >
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">
                          {task.assigneeName ?? '—'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {task.bookingReference ? (
                        <Link
                          to={`/dashboard/bookings/${task.bookingId ?? ''}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-accent hover:underline"
                        >
                          {task.bookingReference}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      {task.clientName ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {STATUS_LABELS[task.status]}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label="Task actions"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onRemind && (
                            <DropdownMenuItem
                              onClick={() => onRemind(task.id)}
                            >
                              <Bell className="mr-2 h-4 w-4" />
                              Send reminder
                            </DropdownMenuItem>
                          )}
                          {onComment && (
                            <DropdownMenuItem
                              onClick={() => onComment(task.id)}
                            >
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Add comment
                            </DropdownMenuItem>
                          )}
                          {onEscalate && (
                            <DropdownMenuItem
                              onClick={() => onEscalate(task.id)}
                              className="text-destructive"
                            >
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              Escalate
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
