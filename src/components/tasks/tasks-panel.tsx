/**
 * TasksPanel - Container for Kanban & List views
 * Manages view toggle, filters, bulk actions, modals
 */
import { useState, useCallback } from 'react'
import { Plus, LayoutGrid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { KanbanBoard } from './kanban-board'
import { TasksList } from './tasks-list'
import { TasksFiltersBar } from './tasks-filters-bar'
import { TasksBulkActions } from './tasks-bulk-actions'
import { TaskDetailDrawer } from './task-detail-drawer'
import { QuickCreateTaskModal } from './quick-create-task-modal'
import {
  useTasks,
  useUpdateTask,
  useUpdateTaskStatus,
  useDeleteTask,
  useCreateTask,
  useBulkUpdateTasks,
} from '@/hooks/use-tasks'
import { tasksApi } from '@/api/tasks'
import { toast } from 'sonner'
import type { Task, TaskFilters, TaskStatus, TaskCreatePayload } from '@/types/task'

const DEFAULT_FILTERS: TaskFilters = {
  sort: 'dueDate',
  sortOrder: 'asc',
  page: 1,
  pageSize: 50,
}

export interface TasksPanelProps {
  user?: { id: string; email?: string }
  org?: { id: string }
  bookingContextMap?: Record<string, { id: string; reference?: string }>
  clientContextMap?: Record<string, { id: string; name?: string }>
}

export function TasksPanel(_props: TasksPanelProps) {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [filters, setFilters] = useState<TaskFilters>(DEFAULT_FILTERS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
  const [detailTask, setDetailTask] = useState<Task | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const appliedFilters: TaskFilters = {
    ...filters,
    search: searchQuery.trim() || undefined,
  }

  const { tasks, isLoading, refetch } = useTasks(appliedFilters)

  const updateTask = useUpdateTask()
  const updateStatus = useUpdateTaskStatus()
  const deleteTask = useDeleteTask()
  const createTask = useCreateTask()
  const bulkUpdate = useBulkUpdateTasks()

  const hasActiveFilters =
    !!appliedFilters.status ||
    !!appliedFilters.assigneeId ||
    !!appliedFilters.slaLabel ||
    !!appliedFilters.priority ||
    !!appliedFilters.dueDateFrom ||
    !!appliedFilters.dueDateTo ||
    !!appliedFilters.search

  const handleApplyFilters = useCallback(() => {
    refetch()
  }, [refetch])

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setSearchQuery('')
    refetch()
  }, [refetch])

  const handleTaskClick = useCallback((task: Task) => {
    setDetailTask(task)
    setDetailOpen(true)
  }, [])

  const handleStatusChange = useCallback(
    (taskId: string, status: TaskStatus) => {
      updateStatus.mutate(
        { id: taskId, status },
        {
          onSuccess: () => {
            toast.success('Status updated')
          },
          onError: (err) => {
            toast.error(err?.message ?? 'Failed to update status')
          },
        }
      )
    },
    [updateStatus]
  )

  const handleRemind = useCallback(async (taskId: string) => {
    try {
      await tasksApi.sendReminder(taskId)
      toast.success('Reminder sent')
    } catch {
      toast.error('Failed to send reminder')
    }
  }, [])

  const handleEscalate = useCallback((_taskId: string) => {
    toast.info('Escalation triggered for task')
  }, [])

  const handleSelect = useCallback((taskId: string, selected: boolean) => {
    setSelectedTaskIds((prev) =>
      selected ? [...prev, taskId] : prev.filter((id) => id !== taskId)
    )
  }, [])

  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      setSelectedTaskIds((tasks ?? []).map((t) => t.id))
    } else {
      setSelectedTaskIds([])
    }
  }, [tasks])

  const handleSaveTask = useCallback(
    (id: string, updates: Record<string, unknown>) => {
      updateTask.mutate(
        { id, updates: updates as Partial<TaskCreatePayload> },
        {
          onSuccess: () => {
            toast.success('Task updated')
            setDetailTask((prev) =>
              prev?.id === id ? { ...prev, ...updates } : prev
            )
          },
          onError: (err) => {
            toast.error(err?.message ?? 'Failed to update task')
          },
        }
      )
    },
    [updateTask]
  )

  const handleDeleteTask = useCallback(
    (id: string) => {
      deleteTask.mutate(id, {
        onSuccess: () => {
          toast.success('Task deleted')
          setDetailOpen(false)
          setDetailTask(null)
          setSelectedTaskIds((prev) => prev.filter((x) => x !== id))
        },
        onError: (err) => {
          toast.error(err?.message ?? 'Failed to delete task')
        },
      })
    },
    [deleteTask]
  )

  const handleCreateTask = useCallback(
    (payload: TaskCreatePayload) => {
      createTask.mutate(payload, {
        onSuccess: () => {
          toast.success('Task created')
          setCreateModalOpen(false)
        },
        onError: (err) => {
          toast.error(err?.message ?? 'Failed to create task')
        },
      })
    },
    [createTask]
  )

  const handleBulkAssign = useCallback(
    (assigneeId: string) => {
      if (selectedTaskIds.length === 0) return
      bulkUpdate.mutate(
        { ids: selectedTaskIds, updates: { assigneeId } },
        {
          onSuccess: () => {
            toast.success(`Assigned ${selectedTaskIds.length} tasks`)
            setSelectedTaskIds([])
          },
          onError: (err) => {
            toast.error(err?.message ?? 'Failed to assign')
          },
        }
      )
    },
    [selectedTaskIds, bulkUpdate]
  )

  const handleBulkDueDate = useCallback(
    (dueDate: string) => {
      if (selectedTaskIds.length === 0) return
      bulkUpdate.mutate(
        { ids: selectedTaskIds, updates: { dueDate } },
        {
          onSuccess: () => {
            toast.success(`Updated due date for ${selectedTaskIds.length} tasks`)
            setSelectedTaskIds([])
          },
          onError: (err) => {
            toast.error(err?.message ?? 'Failed to update due date')
          },
        }
      )
    },
    [selectedTaskIds, bulkUpdate]
  )

  const handleBulkRemind = useCallback(async () => {
    for (const id of selectedTaskIds) {
      await tasksApi.sendReminder(id)
    }
    toast.success(`Reminders sent for ${selectedTaskIds.length} tasks`)
    setSelectedTaskIds([])
  }, [selectedTaskIds])

  const taskList = tasks ?? []

  const handleCommentForList = useCallback(
    (taskId: string) => {
      const task = taskList.find((t) => t.id === taskId)
      if (task) handleTaskClick(task)
    },
    [handleTaskClick, taskList]
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Tasks</h1>
          <p className="mt-1 text-muted-foreground">
            Operational tasks and SLAs
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-border p-1">
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
              aria-label="Kanban view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      <TasksFiltersBar
        filters={appliedFilters}
        onFiltersChange={(f) => {
          setFilters(f)
          if (f.search !== undefined) setSearchQuery(f.search ?? '')
        }}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <TasksBulkActions
        selectedCount={selectedTaskIds.length}
        onBulkAssign={handleBulkAssign}
        onBulkDueDate={handleBulkDueDate}
        onBulkRemind={handleBulkRemind}
        onClearSelection={() => setSelectedTaskIds([])}
        isUpdating={bulkUpdate.isPending}
      />

      {viewMode === 'kanban' ? (
        <KanbanBoard
          tasks={taskList}
          onStatusChange={handleStatusChange}
          onTaskClick={handleTaskClick}
          onRemind={handleRemind}
          onComment={handleCommentForList}
          onEscalate={handleEscalate}
          selectedTaskIds={selectedTaskIds}
          onSelect={handleSelect}
          showCheckbox
          isLoading={isLoading}
        />
      ) : (
        <TasksList
          tasks={taskList}
          sortField={filters.sort}
          sortOrder={filters.sortOrder}
          onSort={(field) =>
            setFilters((f) => ({
              ...f,
              sort: field as TaskFilters['sort'],
              sortOrder:
                f.sort === field && f.sortOrder === 'asc' ? 'desc' : 'asc',
            }))
          }
          onTaskClick={handleTaskClick}
          onRemind={handleRemind}
          onComment={handleCommentForList}
          onEscalate={handleEscalate}
          selectedTaskIds={selectedTaskIds}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
          isLoading={isLoading}
        />
      )}

      <TaskDetailDrawer
        task={detailTask}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        isSaving={updateTask.isPending}
        isDeleting={deleteTask.isPending}
      />

      <QuickCreateTaskModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreate={handleCreateTask}
        isCreating={createTask.isPending}
      />
    </div>
  )
}
