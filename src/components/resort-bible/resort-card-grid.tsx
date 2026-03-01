/**
 * ResortCardGrid - Grid/list of resort cards with skeleton loading
 */
import { ResortCard } from './resort-card'
import { Skeleton } from '@/components/ui/skeleton'
import { ensureArray } from '@/lib/resort-bible-utils'
import type { Resort } from '@/types/resort-bible'

export interface ResortCardGridProps {
  resorts: Resort[]
  isLoading?: boolean
  selectedIds?: string[]
  onToggleSelect?: (id: string) => void
  onToggleSelectAll?: (ids: string[], checked: boolean) => void
  onAddToShortlist?: (id: string) => void
  onCompare?: (id: string) => void
  onExport?: (id: string) => void
  showCheckboxes?: boolean
  viewMode?: 'grid' | 'list'
}

function ResortCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Skeleton className="h-40 w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    </div>
  )
}

export function ResortCardGrid({
  resorts,
  isLoading,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  onAddToShortlist,
  onCompare,
  onExport,
  showCheckboxes,
  viewMode = 'grid',
}: ResortCardGridProps) {
  const list = ensureArray(resorts)
  const selectedSet = new Set(selectedIds ?? [])
  const resortIds = list.map((r) => r.id)
  const allSelected = resortIds.length > 0 && resortIds.every((id) => selectedSet.has(id))

  if (isLoading) {
    return (
      <div
        className={
          viewMode === 'list'
            ? 'flex flex-col gap-4'
            : 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        }
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <ResortCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div
      className={
        viewMode === 'list'
          ? 'flex flex-col gap-4'
          : 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      }
    >
      {showCheckboxes && onToggleSelectAll && resortIds.length > 0 && (
        <div className="flex w-full items-center gap-2 px-1 sm:col-span-2 lg:col-span-3 xl:col-span-4">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => onToggleSelectAll(resortIds, e.target.checked)}
            aria-label="Select all resorts"
            className="h-4 w-4 rounded border-border"
          />
          <span className="text-sm text-muted-foreground">Select all</span>
        </div>
      )}
      {list.map((resort) => (
        <ResortCard
          key={resort.id}
          resort={resort}
          selected={selectedSet.has(resort.id)}
          onToggleSelect={onToggleSelect}
          onAddToShortlist={onAddToShortlist}
          onCompare={onCompare}
          onExport={onExport}
          showCheckbox={showCheckboxes}
          className={viewMode === 'list' ? 'flex flex-row' : undefined}
        />
      ))}
    </div>
  )
}
