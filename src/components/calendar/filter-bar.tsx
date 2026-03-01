/**
 * FilterBar - Multi-select for agents, resorts, and status chips
 */
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CalendarFilters } from '@/types/calendar'
import type { Agent, Resort } from '@/types/calendar'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'overdue', label: 'Overdue' },
] as const

export interface FilterBarProps {
  agents: Agent[]
  resorts: Resort[]
  filters: CalendarFilters
  onFiltersChange: (f: CalendarFilters) => void
  className?: string
}

export function FilterBar({
  agents = [],
  resorts = [],
  filters,
  onFiltersChange,
  className,
}: FilterBarProps) {
  const toggleStatus = (value: string) => {
    const current = filters.status ?? []
    const next = current.includes(value)
      ? current.filter((s) => s !== value)
      : [...current, value]
    onFiltersChange({ ...filters, status: next })
  }

  const clearFilters = () => {
    onFiltersChange({
      agentIds: [],
      resortIds: [],
      status: [],
    })
  }

  const hasActiveFilters =
    (filters.agentIds?.length ?? 0) > 0 ||
    (filters.resortIds?.length ?? 0) > 0 ||
    (filters.status?.length ?? 0) > 0

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <Select
        value={filters.agentIds?.[0] ?? '_none'}
        onValueChange={(v) =>
          onFiltersChange({
            ...filters,
            agentIds: v === '_none' ? [] : [v],
          })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All agents" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_none">All agents</SelectItem>
          {(agents ?? []).map((a) => (
            <SelectItem key={a.id} value={a.id}>
              {a.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.resortIds?.[0] ?? '_none'}
        onValueChange={(v) =>
          onFiltersChange({
            ...filters,
            resortIds: v === '_none' ? [] : [v],
          })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All resorts" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_none">All resorts</SelectItem>
          {(resorts ?? []).map((r) => (
            <SelectItem key={r.id} value={r.id}>
              {r.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex flex-wrap gap-1.5">
        {STATUS_OPTIONS.map((opt) => {
          const isActive = (filters.status ?? []).includes(opt.value)
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleStatus(opt.value)}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              )}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  )
}
