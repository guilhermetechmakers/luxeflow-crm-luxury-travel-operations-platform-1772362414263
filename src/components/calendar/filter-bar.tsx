/**
 * FilterBar - Multi-select for agents, resorts, status chips, and search
 * LuxeFlow design: olive accent, clean cards, generous spacing
 */
import { useCallback, useState, useEffect, useRef } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { X, ChevronDown, Search } from 'lucide-react'
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

const SEARCH_DEBOUNCE_MS = 300

export interface FilterBarProps {
  agents: Agent[]
  resorts: Resort[]
  filters: CalendarFilters
  onFiltersChange: (f: CalendarFilters) => void
  className?: string
}

function MultiSelectPopover({
  label,
  options,
  selectedIds,
  onToggle,
  placeholder = 'All',
}: {
  label: string
  options: { id: string; name: string }[]
  selectedIds: string[]
  onToggle: (id: string, checked: boolean) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const displayText =
    selectedIds.length === 0
      ? placeholder
      : selectedIds.length === 1
        ? options.find((o) => o.id === selectedIds[0])?.name ?? `${selectedIds.length} selected`
        : `${selectedIds.length} selected`

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-[180px] justify-between font-normal"
          aria-label={`Filter by ${label}`}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="truncate">{displayText}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="start">
        <div className="p-2 border-b border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </p>
        </div>
        <div
          className="max-h-[240px] overflow-y-auto p-2"
          role="listbox"
          aria-multiselectable
        >
          {(options ?? []).map((opt) => {
            const checked = (selectedIds ?? []).includes(opt.id)
            return (
              <label
                key={opt.id}
                className={cn(
                  'flex items-center gap-2 px-2 py-0.5 rounded-md cursor-pointer',
                  'hover:bg-secondary/80 transition-colors',
                  'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1'
                )}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(c) => onToggle(opt.id, c === true)}
                  aria-label={opt.name}
                />
                <span className="text-sm truncate">{opt.name}</span>
              </label>
            )
          })}
          {(!options || options.length === 0) && (
            <p className="text-sm text-muted-foreground py-2 px-2">No options</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function FilterBar({
  agents = [],
  resorts = [],
  filters,
  onFiltersChange,
  className,
}: FilterBarProps) {
  const [searchInput, setSearchInput] = useState(filters.searchQuery ?? '')
  const filtersRef = useRef(filters)
  filtersRef.current = filters

  useEffect(() => {
    const t = setTimeout(() => {
      const q = searchInput.trim()
      onFiltersChange({ ...filtersRef.current, searchQuery: q || undefined })
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [searchInput, onFiltersChange])

  const toggleAgent = useCallback(
    (id: string, checked: boolean) => {
      const current = filters.agentIds ?? []
      const next = checked
        ? [...current, id]
        : current.filter((a) => a !== id)
      onFiltersChange({ ...filters, agentIds: next })
    },
    [filters, onFiltersChange]
  )

  const toggleResort = useCallback(
    (id: string, checked: boolean) => {
      const current = filters.resortIds ?? []
      const next = checked
        ? [...current, id]
        : current.filter((r) => r !== id)
      onFiltersChange({ ...filters, resortIds: next })
    },
    [filters, onFiltersChange]
  )

  const toggleStatus = (value: string) => {
    const current = filters.status ?? []
    const next = current.includes(value)
      ? current.filter((s) => s !== value)
      : [...current, value]
    onFiltersChange({ ...filters, status: next })
  }

  const clearFilters = () => {
    setSearchInput('')
    onFiltersChange({
      agentIds: [],
      resortIds: [],
      status: [],
      searchQuery: undefined,
    })
  }

  const hasActiveFilters =
    (filters.agentIds?.length ?? 0) > 0 ||
    (filters.resortIds?.length ?? 0) > 0 ||
    (filters.status?.length ?? 0) > 0 ||
    (filters.searchQuery?.trim?.() ?? '').length > 0

  return (
    <div
      className={cn('flex flex-wrap items-center gap-3', className)}
      role="search"
      aria-label="Calendar filters"
    >
      <div className="relative flex-1 min-w-[120px] max-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search guest or booking..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9 h-9"
          aria-label="Search by guest or booking"
        />
      </div>

      <MultiSelectPopover
        label="Agents"
        options={agents}
        selectedIds={filters.agentIds ?? []}
        onToggle={toggleAgent}
        placeholder="All agents"
      />

      <MultiSelectPopover
        label="Resorts"
        options={resorts}
        selectedIds={filters.resortIds ?? []}
        onToggle={toggleResort}
        placeholder="All resorts"
      />

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Status filters">
        {STATUS_OPTIONS.map((opt) => {
          const isActive = (filters.status ?? []).includes(opt.value)
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleStatus(opt.value)}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                'hover:scale-[1.02] active:scale-[0.98]',
                isActive
                  ? 'bg-accent text-accent-foreground shadow-sm'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              )}
              aria-pressed={isActive}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          aria-label="Clear all filters"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  )
}
