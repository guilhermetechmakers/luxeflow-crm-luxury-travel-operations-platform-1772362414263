/**
 * TasksFiltersBar - Status, assignee, SLA, date range, priority, search, sort
 * Multi-select filters with apply/reset
 */
import { useState, useCallback, useEffect } from 'react'
import { Search } from 'lucide-react'
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
import type { TaskFilters, TaskStatus, TaskPriority } from '@/types/task'

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'done', label: 'Done' },
]

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

const SLA_OPTIONS = [
  { value: '24h', label: '24h' },
  { value: '48h', label: '48h' },
  { value: '72h', label: '72h' },
]

const SORT_OPTIONS: { value: TaskFilters['sort']; label: string }[] = [
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'assignee', label: 'Assignee' },
  { value: 'booking', label: 'Booking' },
  { value: 'client', label: 'Client' },
  { value: 'createdAt', label: 'Created' },
]

export interface TasksFiltersBarProps {
  filters: TaskFilters
  onFiltersChange: (f: TaskFilters) => void
  onApply: () => void
  onReset: () => void
  hasActiveFilters: boolean
}

export function TasksFiltersBar({
  filters,
  onFiltersChange,
  onApply,
  onReset,
  hasActiveFilters,
}: TasksFiltersBarProps) {
  const [searchInput, setSearchInput] = useState(filters.search ?? '')
  const { agents } = useAgentsForTasks()

  useEffect(() => {
    setSearchInput(filters.search ?? '')
  }, [filters.search])

  const handleApply = useCallback(() => {
    onFiltersChange({ ...filters, search: searchInput.trim() || undefined })
    onApply()
  }, [filters, searchInput, onFiltersChange, onApply])

  const handleReset = useCallback(() => {
    setSearchInput('')
    onReset()
  }, [onReset])

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          placeholder="Search title, booking ref, client..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          className="pl-9"
          aria-label="Search tasks"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={String(
            Array.isArray(filters.status)
              ? filters.status[0] ?? 'all'
              : (filters.status ?? 'all')
          )}
          onValueChange={(v) =>
            onFiltersChange({
              ...filters,
              status: v === 'all' ? undefined : (v as TaskStatus),
            })
          }
        >
          <SelectTrigger className="w-[140px]" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.assigneeId ?? 'all'}
          onValueChange={(v) =>
            onFiltersChange({
              ...filters,
              assigneeId: v === 'all' ? undefined : v,
            })
          }
        >
          <SelectTrigger className="w-[160px]" aria-label="Filter by assignee">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Agents</SelectItem>
            {(agents ?? []).map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.slaLabel ?? 'all'}
          onValueChange={(v) =>
            onFiltersChange({
              ...filters,
              slaLabel: v === 'all' ? undefined : v,
            })
          }
        >
          <SelectTrigger className="w-[100px]" aria-label="Filter by SLA">
            <SelectValue placeholder="SLA" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All SLA</SelectItem>
            {SLA_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(
            Array.isArray(filters.priority)
              ? filters.priority[0] ?? 'all'
              : (filters.priority ?? 'all')
          )}
          onValueChange={(v) =>
            onFiltersChange({
              ...filters,
              priority: v === 'all' ? undefined : (v as TaskPriority),
            })
          }
        >
          <SelectTrigger className="w-[120px]" aria-label="Filter by priority">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {PRIORITY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={filters.dueDateFrom ?? ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              dueDateFrom: e.target.value || undefined,
            })
          }
          className="w-[140px]"
          aria-label="Due date from"
        />
        <Input
          type="date"
          value={filters.dueDateTo ?? ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              dueDateTo: e.target.value || undefined,
            })
          }
          className="w-[140px]"
          aria-label="Due date to"
        />

        <Select
          value={`${filters.sort ?? 'dueDate'}-${filters.sortOrder ?? 'asc'}`}
          onValueChange={(v) => {
            const [sort, sortOrder] = v.split('-') as [
              TaskFilters['sort'],
              'asc' | 'desc',
            ]
            onFiltersChange({ ...filters, sort, sortOrder })
          }}
        >
          <SelectTrigger className="w-[180px]" aria-label="Sort by">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.flatMap((opt) => [
              <SelectItem key={`${opt.value}-asc`} value={`${opt.value}-asc`}>
                {opt.label} (Asc)
              </SelectItem>,
              <SelectItem key={`${opt.value}-desc`} value={`${opt.value}-desc`}>
                {opt.label} (Desc)
              </SelectItem>,
            ])}
          </SelectContent>
        </Select>

        <Button size="sm" onClick={handleApply} aria-label="Apply filters">
          Apply
        </Button>
        {(hasActiveFilters || searchInput) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            aria-label="Reset filters"
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  )
}
