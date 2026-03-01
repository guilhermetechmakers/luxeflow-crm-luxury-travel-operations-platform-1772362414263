/**
 * KanbanTaskItem - Draggable task card for Kanban (cross-column drag)
 */
import { useDraggable } from '@dnd-kit/core'
import { TaskCard } from './task-card'
import type { Task } from '@/types/task'

export interface KanbanTaskItemProps {
  task: Task
  onTaskClick: (task: Task) => void
}

export function KanbanTaskItem({ task, onTaskClick }: KanbanTaskItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
  })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="touch-none"
    >
      <TaskCard task={task} onClick={onTaskClick} isDragging={isDragging} />
    </div>
  )
}
