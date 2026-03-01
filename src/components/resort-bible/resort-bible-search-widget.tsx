/**
 * ResortBibleDirectorySearchWidget - Global faceted search for related resorts
 * Features: kids-friendly, transferTimeMax, region, beach, bedCount facets
 * Search input with debounce, results count, standardized field mapping
 * Runtime safety: validate response shapes; guard arrays with (data ?? []).map(...)
 */
import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { resortBibleApi } from '@/api/resort-bible'
import { ensureArray } from '@/lib/resort-bible-utils'
import type { Resort, ResortFilters } from '@/types/resort-bible'
import { cn } from '@/lib/utils'

const KIDS_OPTIONS = [
  { value: 'Family-friendly', label: 'Family-friendly' },
  { value: 'All ages welcome', label: 'All ages' },
]
const TRANSFER_OPTIONS = [
  { value: 15, label: '≤ 15 min' },
  { value: 30, label: '≤ 30 min' },
  { value: 45, label: '≤ 45 min' },
  { value: 60, label: '≤ 60 min' },
  { value: 90, label: '≤ 90 min' },
]
const REGIONS = ['Cyclades', 'Swiss Alps', 'Haute-Savoie', 'Campania', 'Mediterranean']

export interface ResortBibleDirectorySearchWidgetProps {
  /** Exclude this resort ID from results (current resort) */
  excludeResortId?: string
  /** Max results to show */
  maxResults?: number
  className?: string
}

export function ResortBibleDirectorySearchWidget({
  excludeResortId,
  maxResults = 6,
  className,
}: ResortBibleDirectorySearchWidgetProps) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<ResortFilters>({
    kidsPolicy: undefined,
    transferTimeMax: undefined,
    region: undefined,
    beachPresence: undefined,
    twoBedroomSuites: undefined,
  })

  const effectiveFilters: ResortFilters = useMemo(
    () => ({
      search: searchQuery.trim() || undefined,
      ...filters,
    }),
    [searchQuery, filters]
  )

  const { data, isLoading } = useQuery({
    queryKey: ['resorts', 'search', effectiveFilters],
    queryFn: () =>
      resortBibleApi.getResorts(effectiveFilters, 1, maxResults + 10),
    staleTime: 30 * 1000,
  })

  const resorts = ensureArray(data?.data)
  const filteredResorts = useMemo(() => {
    const list = resorts.filter((r) => r.id !== excludeResortId)
    return list.slice(0, maxResults)
  }, [resorts, excludeResortId, maxResults])

  const hasActiveFilters = Boolean(
    filters.kidsPolicy ||
      filters.transferTimeMax != null ||
      filters.region ||
      filters.beachPresence ||
      filters.twoBedroomSuites
  )

  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-4 shadow-card',
        className
      )}
      role="search"
      aria-label="Search related resorts"
    >
      <h3 className="mb-3 font-serif text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Related resorts
      </h3>
      <div className="flex flex-col gap-2">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            placeholder="Search resorts by name, location, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            aria-label="Search resorts"
          />
        </div>
        <Button
          variant={showFilters ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          aria-label="Toggle filters"
          aria-pressed={showFilters}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {showFilters && (
        <div className="mt-4 space-y-3 border-t border-border pt-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <label className="text-xs uppercase text-muted-foreground">
                Kids-friendly
              </label>
              <select
                value={filters.kidsPolicy ?? ''}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    kidsPolicy: e.target.value || undefined,
                  }))
                }
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                aria-label="Kids policy filter"
              >
                <option value="">Any</option>
                {KIDS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase text-muted-foreground">
                Max transfer
              </label>
              <select
                value={filters.transferTimeMax ?? ''}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    transferTimeMax: e.target.value
                      ? parseInt(e.target.value, 10)
                      : undefined,
                  }))
                }
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                aria-label="Transfer time filter"
              >
                <option value="">Any</option>
                {TRANSFER_OPTIONS.map((o) => (
                  <option key={o.value} value={String(o.value)}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase text-muted-foreground">
                Region
              </label>
              <select
                value={filters.region ?? ''}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, region: e.target.value || undefined }))
                }
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                aria-label="Region filter"
              >
                <option value="">Any</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase text-muted-foreground">
                Beach
              </label>
              <select
                value={filters.beachPresence ?? ''}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    beachPresence: e.target.value || undefined,
                  }))
                }
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                aria-label="Beach presence filter"
              >
                <option value="">Any</option>
                <option value="beachfront">Beachfront</option>
                <option value="beach">Beach access</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase text-muted-foreground">
                2-bedroom
              </label>
              <select
                value={filters.twoBedroomSuites ? 'yes' : ''}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    twoBedroomSuites: e.target.value === 'yes' ? true : undefined,
                  }))
                }
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                aria-label="2-bedroom filter"
              >
                <option value="">Any</option>
                <option value="yes">2-bedroom suites only</option>
              </select>
            </div>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4" />
              Clear filters
            </Button>
          )}
        </div>
      )}

      <div className="mt-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : filteredResorts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No matching resorts</p>
        ) : (
          <>
            <p className="mb-2 text-xs text-muted-foreground">
              {filteredResorts.length} result{filteredResorts.length !== 1 ? 's' : ''}
            </p>
            <ul className="space-y-2" role="list">
              {filteredResorts.map((r: Resort) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/dashboard/resorts/${r.id}`)}
                    className="w-full rounded-md border border-border px-3 py-2 text-left text-sm transition-colors hover:bg-secondary hover:shadow-card"
                  >
                    <span className="font-medium">{r.name}</span>
                    <span className="ml-2 text-muted-foreground">
                      {[r.location?.city, r.location?.country]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
