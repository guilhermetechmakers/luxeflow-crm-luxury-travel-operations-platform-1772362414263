/**
 * KanbanBoard - Columns for To Do, In Progress, Review, Blocked, Done
 * Drag-and-drop between columns with optimistic updates
 */
import { useCallback, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'
import { KanbanColumn } from './kanban-column'
import { TaskCard } from './task-card'
import type { Task, TaskStatus } from '@/types/task'

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'blocked', title: 'Blocked' },
  { id: 'done', title: 'Done' },
]

function groupTasksByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  const grouped = COLUMNS.reduce(
    (acc, col) => {
      acc[col.id] = []
      return acc
    },
    {} as Record<TaskStatus, Task[]>
  )
  for (const t of tasks ?? []) {
    const status = t.status ?? 'todo'
    if (grouped[status]) {
      grouped[status].push(t)
    } else {
      grouped.todo.push(t)
    }
  }
  return grouped
}

export interface KanbanBoardProps {
  tasks: Task[]
  onStatusChange: (taskId: string, status: TaskStatus) => void
  onTaskClick?: (task: Task) => void
  onRemind?: (taskId: string) => void
  onComment?: (taskId: string) => void
  onEscalate?: (taskId: string) => void
  selectedTaskIds?: string[]
  onSelect?: (taskId: string, selected: boolean) => void
  showCheckbox?: boolean
  isLoading?: boolean
}

export function KanbanBoard({
  tasks,
  onStatusChange,
  onTaskClick,
  onRemind,
  onComment,
  onEscalate,
  selectedTaskIds = [],
  onSelect,
  showCheckbox,
  isLoading,
}: KanbanBoardProps) {
  const grouped = groupTasksByStatus(tasks ?? [])
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = (tasks ?? []).find((t) => t.id === event.active.id)
    if (task) setActiveTask(task)
  }, [tasks])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveTask(null)
      const { active, over } = event
      if (!over) return
      const taskId = String(active.id)
      const overId = String(over.id)
      const newStatus = COLUMNS.find((c) => c.id === overId)?.id
      if (newStatus) {
        onStatusChange(taskId, newStatus)
      }
    },
    [onStatusChange]
  )

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCorners}
      modifiers={[restrictToHorizontalAxis]}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            tasks={grouped[col.id] ?? []}
            onTaskClick={onTaskClick}
            onRemind={onRemind}
            onComment={onComment}
            onEscalate={onEscalate}
            selectedTaskIds={selectedTaskIds}
            onSelect={onSelect}
            showCheckbox={showCheckbox}
            isLoading={isLoading}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-2 opacity-90">
            <TaskCard task={activeTask} className="shadow-lg" />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
