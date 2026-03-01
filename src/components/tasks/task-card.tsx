/**
 * TaskCard - Displays task with title, assignee, due date, SLA, booking/client chips
 * LuxeFlow design: white card, hover lift, olive accent
 */
import { Link } from 'react-router-dom'
import {
  Bell,
  MessageSquare,
  AlertTriangle,
  Calendar,
  User,
  FileText,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { Task } from '@/types/task'

const STATUS_LABELS: Record<Task['status'], string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  blocked: 'Blocked',
  done: 'Done',
}

const PRIORITY_VARIANTS: Record<
  Task['priority'],
  'default' | 'secondary' | 'destructive' | 'warning' | 'outline'
> = {
  low: 'outline',
  medium: 'secondary',
  high: 'default',
  urgent: 'destructive',
}

export interface TaskCardProps {
  task: Task
  onClick?: (task: Task) => void
  onRemind?: (taskId: string) => void
  onComment?: (taskId: string) => void
  onEscalate?: (taskId: string) => void
  isSelected?: boolean
  onSelect?: (taskId: string, selected: boolean) => void
  showCheckbox?: boolean
  isDragging?: boolean
  className?: string
}

export function TaskCard({
  task,
  onClick,
  onRemind,
  onComment,
  onEscalate,
  isSelected,
  onSelect,
  showCheckbox,
  isDragging,
  className,
}: TaskCardProps) {
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
    <Card
      className={cn(
        'group cursor-pointer transition-all duration-200 hover:shadow-card-hover',
        isSelected && 'ring-2 ring-accent',
        isDragging && 'opacity-60 shadow-lg',
        className
      )}
      onClick={() => {
        if (showCheckbox && onSelect) {
          onSelect(task.id, !isSelected)
        } else if (onClick) {
          onClick(task)
        }
      }}
    >
      <CardContent className="p-4">
        <div className="flex gap-3">
          {showCheckbox && (
            <input
              type="checkbox"
              checked={!!isSelected}
              onChange={(e) => {
                e.stopPropagation()
                onSelect?.(task.id, e.target.checked)
              }}
              onClick={(e) => e.stopPropagation()}
              className="h-4 w-4 rounded border-border"
              aria-label={`Select task ${task.title}`}
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-foreground line-clamp-2">
                {task.title}
              </h4>
              <Badge
                variant={PRIORITY_VARIANTS[task.priority]}
                className="shrink-0 text-xs"
              >
                {task.priority}
              </Badge>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {task.assigneeName && (
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {task.assigneeName}
                </span>
              )}
              {task.dueDate && (
                <span
                  className={cn(
                    'flex items-center gap-1',
                    isOverdue && 'text-destructive font-medium'
                  )}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
              {task.slaLabel && (
                <Badge variant="outline" className="text-xs">
                  {task.slaLabel}
                </Badge>
              )}
            </div>

            <div className="mt-2 flex flex-wrap gap-1">
              {task.bookingReference && (
                <Link
                  to={`/dashboard/bookings/${task.bookingId ?? ''}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 rounded-md bg-secondary/50 px-2 py-0.5 text-xs text-muted-foreground hover:bg-accent/15 hover:text-accent"
                >
                  <FileText className="h-3 w-3" />
                  {task.bookingReference}
                </Link>
              )}
              {task.clientName && (
                <Link
                  to={`/dashboard/clients/${task.clientId ?? ''}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 rounded-md bg-secondary/50 px-2 py-0.5 text-xs text-muted-foreground hover:bg-accent/15 hover:text-accent"
                >
                  {task.clientName}
                </Link>
              )}
            </div>

            <div className="mt-2 flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                {STATUS_LABELS[task.status]}
              </Badge>
              {(task.mentions ?? []).length > 0 && (
                <span className="text-xs text-muted-foreground">
                  @{(task.mentions ?? []).length} mentioned
                </span>
              )}
            </div>

            {(onRemind || onComment || onEscalate) && (
              <div className="mt-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                {onRemind && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemind(task.id)
                    }}
                    className="rounded p-1.5 text-muted-foreground hover:bg-accent/15 hover:text-accent"
                    aria-label="Send reminder"
                  >
                    <Bell className="h-4 w-4" />
                  </button>
                )}
                {onComment && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onComment(task.id)
                    }}
                    className="rounded p-1.5 text-muted-foreground hover:bg-accent/15 hover:text-accent"
                    aria-label="Add comment"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                )}
                {onEscalate && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEscalate(task.id)
                    }}
                    className="rounded p-1.5 text-muted-foreground hover:bg-accent/15 hover:text-destructive"
                    aria-label="Escalate"
                  >
                    <AlertTriangle className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>
          {task.assigneeName && (
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
