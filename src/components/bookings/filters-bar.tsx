/**
 * FiltersBar - Status, agent, resort, date range, balance, search, sort
 * Validates inputs, triggers data fetch on apply
 */
import { useState, useCallback } from 'react'
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
import { useAgents, useResorts } from '@/hooks/use-agents-resorts'
import type { BookingFilters, BookingStatus } from '@/types/booking'

const STATUS_OPTIONS: { value: BookingStatus; label: string }[] = [
  { value: 'quote', label: 'Quote' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'pre_arrival', label: 'Pre-arrival' },
  { value: 'in_stay', label: 'In-stay' },
  { value: 'completed', label: 'Completed' },
]

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'last_updated', label: 'Last Updated' },
  { value: 'check_in', label: 'Check-in' },
  { value: 'check_out', label: 'Check-out' },
  { value: 'value', label: 'Value' },
  { value: 'balance_due', label: 'Outstanding Balance' },
  { value: 'status', label: 'Status' },
  { value: 'booking_ref', label: 'Reference' },
]

export interface BookingsFiltersBarProps {
  filters: BookingFilters
  onFiltersChange: (f: BookingFilters) => void
  onApply: () => void
  onReset: () => void
  hasActiveFilters: boolean
}

export function BookingsFiltersBar({
  filters,
  onFiltersChange,
  onApply,
  onReset,
  hasActiveFilters,
}: BookingsFiltersBarProps) {
  const [searchInput, setSearchInput] = useState(filters.search ?? '')
  const { agents } = useAgents()
  const { resorts } = useResorts()

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
          placeholder="Search client, ref, resort..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          className="pl-9"
          aria-label="Search bookings"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={filters.status ?? 'all'}
          onValueChange={(v) =>
            onFiltersChange({ ...filters, status: v === 'all' ? undefined : (v as BookingStatus) })
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
          value={filters.agent_id ?? 'all'}
          onValueChange={(v) =>
            onFiltersChange({ ...filters, agent_id: v === 'all' ? undefined : v })
          }
        >
          <SelectTrigger className="w-[160px]" aria-label="Filter by agent">
            <SelectValue placeholder="Agent" />
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
          value={filters.resort_id ?? 'all'}
          onValueChange={(v) =>
            onFiltersChange({ ...filters, resort_id: v === 'all' ? undefined : v })
          }
        >
          <SelectTrigger className="w-[160px]" aria-label="Filter by resort">
            <SelectValue placeholder="Resort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Resorts</SelectItem>
            {(resorts ?? []).map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={filters.check_in_from ?? ''}
          onChange={(e) =>
            onFiltersChange({ ...filters, check_in_from: e.target.value || undefined })
          }
          className="w-[140px]"
          aria-label="Check-in from"
        />
        <Input
          type="date"
          value={filters.check_in_to ?? ''}
          onChange={(e) =>
            onFiltersChange({ ...filters, check_in_to: e.target.value || undefined })
          }
          className="w-[140px]"
          aria-label="Check-in to"
        />

        <Input
          type="number"
          min={0}
          placeholder="Min balance"
          value={filters.balance_min ?? ''}
          onChange={(e) => {
            const v = e.target.value
            onFiltersChange({
              ...filters,
              balance_min: v === '' ? undefined : Math.max(0, Number(v) || 0),
            })
          }}
          className="w-[120px]"
          aria-label="Minimum outstanding balance"
        />

        <Select
          value={`${filters.sort ?? 'last_updated'}-${filters.sortOrder ?? 'desc'}`}
          onValueChange={(v) => {
            const [sort, sortOrder] = v.split('-') as [BookingFilters['sort'], 'asc' | 'desc']
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
