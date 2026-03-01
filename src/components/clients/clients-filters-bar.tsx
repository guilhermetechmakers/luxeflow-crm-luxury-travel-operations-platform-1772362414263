/**
 * FiltersBar - Chips for VIP, Family, Frequent Traveler, Country, Last Active, sort controls
 */
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ClientFilters, ClientSortField } from '@/types/client'

const LAST_ACTIVE_OPTIONS = [
  { value: 'any', label: 'Any time' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '6m', label: 'Last 6 months' },
] as const

function getLastActiveRange(value: string): { from?: string; to?: string } {
  if (value === 'any') return {}
  const to = new Date()
  to.setHours(23, 59, 59, 999)
  const toStr = to.toISOString()
  let from: Date
  switch (value) {
    case '7d':
      from = new Date()
      from.setDate(from.getDate() - 7)
      break
    case '30d':
      from = new Date()
      from.setDate(from.getDate() - 30)
      break
    case '90d':
      from = new Date()
      from.setDate(from.getDate() - 90)
      break
    case '6m':
      from = new Date()
      from.setMonth(from.getMonth() - 6)
      break
    default:
      return {}
  }
  from.setHours(0, 0, 0, 0)
  return { from: from.toISOString(), to: toStr }
}

function getLastActiveValue(filters: ClientFilters): string {
  if (!filters.lastActiveFrom && !filters.lastActiveTo) return 'any'
  const from = filters.lastActiveFrom ? new Date(filters.lastActiveFrom).getTime() : 0
  const now = Date.now()
  const diffDays = (now - from) / (1000 * 60 * 60 * 24)
  if (diffDays <= 7) return '7d'
  if (diffDays <= 30) return '30d'
  if (diffDays <= 90) return '90d'
  if (diffDays <= 180) return '6m'
  return 'any'
}

const COUNTRIES = [
  'United States',
  'United Kingdom',
  'France',
  'Germany',
  'Spain',
  'Italy',
  'Switzerland',
  'Other',
]

const SORT_OPTIONS: { value: ClientSortField; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'nextTripDate', label: 'Next Trip' },
  { value: 'outstandingBalance', label: 'Balance' },
  { value: 'lastContact', label: 'Last Contact' },
  { value: 'lastActive', label: 'Last Active' },
  { value: 'country', label: 'Country' },
]

export interface ClientsFiltersBarProps {
  filters: ClientFilters
  onFiltersChange: (f: ClientFilters) => void
  onClearFilters: () => void
  hasActiveFilters: boolean
}

export function ClientsFiltersBar({
  filters,
  onFiltersChange,
  onClearFilters,
  hasActiveFilters,
}: ClientsFiltersBarProps) {
  const toggleFilter = (key: keyof ClientFilters, value: unknown) => {
    const current = filters[key]
    const newVal = current === value ? undefined : value
    onFiltersChange({ ...filters, [key]: newVal })
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        variant={filters.vip ? 'default' : 'outline'}
        size="sm"
        onClick={() => toggleFilter('vip', true)}
        aria-pressed={!!filters.vip}
        aria-label="Filter by VIP"
      >
        VIP
      </Button>
      <Button
        variant={filters.family ? 'default' : 'outline'}
        size="sm"
        onClick={() => toggleFilter('family', true)}
        aria-pressed={!!filters.family}
        aria-label="Filter by Family"
      >
        Family
      </Button>
      <Button
        variant={filters.frequentTraveler ? 'default' : 'outline'}
        size="sm"
        onClick={() => toggleFilter('frequentTraveler', true)}
        aria-pressed={!!filters.frequentTraveler}
        aria-label="Filter by Frequent Traveler"
      >
        Frequent Traveler
      </Button>

      <Select
        value={filters.country ?? 'all'}
        onValueChange={(v) => onFiltersChange({ ...filters, country: v === 'all' ? undefined : v })}
      >
        <SelectTrigger className="w-[180px]" aria-label="Filter by country">
          <SelectValue placeholder="Country" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Countries</SelectItem>
          {COUNTRIES.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={getLastActiveValue(filters)}
        onValueChange={(v) => {
          const range = getLastActiveRange(v)
          onFiltersChange({
            ...filters,
            lastActiveFrom: range.from,
            lastActiveTo: range.to,
          })
        }}
      >
        <SelectTrigger className="w-[160px]" aria-label="Filter by last active">
          <SelectValue placeholder="Last Active" />
        </SelectTrigger>
        <SelectContent>
          {LAST_ACTIVE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={`${filters.sort ?? 'name'}-${filters.sortOrder ?? 'asc'}`}
        onValueChange={(v) => {
          const [sort, sortOrder] = v.split('-') as [ClientSortField, 'asc' | 'desc']
          onFiltersChange({ ...filters, sort, sortOrder })
        }}
      >
        <SelectTrigger className="w-[160px]" aria-label="Sort by">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={`${opt.value}-asc`}>
              {opt.label} (A–Z)
            </SelectItem>
          ))}
          {SORT_OPTIONS.map((opt) => (
            <SelectItem key={`${opt.value}-desc`} value={`${opt.value}-desc`}>
              {opt.label} (Z–A)
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          aria-label="Clear all filters"
        >
          Clear filters
        </Button>
      )}
    </div>
  )
}
