/**
 * KanbanTaskCard - Draggable task card for Kanban columns
 */
import { useDraggable } from '@dnd-kit/core'
import { TaskCard } from './task-card'
import type { Task } from '@/types/task'

export interface KanbanTaskCardProps {
  task: Task
  onClick?: (task: Task) => void
  onRemind?: (taskId: string) => void
  onComment?: (taskId: string) => void
  onEscalate?: (taskId: string) => void
  isSelected?: boolean
  onSelect?: (taskId: string, selected: boolean) => void
  showCheckbox?: boolean
}

export function KanbanTaskCard({
  task,
  onClick,
  onRemind,
  onComment,
  onEscalate,
  isSelected,
  onSelect,
  showCheckbox,
}: KanbanTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ id: task.id })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={isDragging ? 'opacity-50' : ''}
    >
      <TaskCard
        task={task}
        onClick={onClick}
        onRemind={onRemind}
        onComment={onComment}
        onEscalate={onEscalate}
        isSelected={isSelected}
        onSelect={onSelect}
        showCheckbox={showCheckbox}
      />
    </div>
  )
}
