/**
 * KanbanColumn - Droppable column with task cards
 */
import { useDroppable } from '@dnd-kit/core'
import { KanbanTaskCard } from './kanban-task-card'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { Task, TaskStatus } from '@/types/task'

export interface KanbanColumnProps {
  id: TaskStatus
  title: string
  tasks: Task[]
  onTaskClick?: (task: Task) => void
  onRemind?: (taskId: string) => void
  onComment?: (taskId: string) => void
  onEscalate?: (taskId: string) => void
  selectedTaskIds?: string[]
  onSelect?: (taskId: string, selected: boolean) => void
  showCheckbox?: boolean
  isLoading?: boolean
}

export function KanbanColumn({
  id,
  title,
  tasks,
  onTaskClick,
  onRemind,
  onComment,
  onEscalate,
  selectedTaskIds = [],
  onSelect,
  showCheckbox,
  isLoading,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-w-[280px] shrink-0 rounded-lg border-2 border-dashed border-transparent transition-colors',
        isOver && 'border-accent/50 bg-accent/5'
      )}
    >
      <Card className="h-full">
        <CardHeader className="py-3">
          <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </h3>
          <span className="text-xs text-muted-foreground">
            {(tasks ?? []).length} tasks
          </span>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          {isLoading ? (
            <>
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </>
          ) : (
            (tasks ?? []).map((task) => (
              <KanbanTaskCard
                key={task.id}
                task={task}
                onClick={onTaskClick}
                onRemind={onRemind}
                onComment={onComment}
                onEscalate={onEscalate}
                isSelected={selectedTaskIds.includes(task.id)}
                onSelect={onSelect}
                showCheckbox={showCheckbox}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
