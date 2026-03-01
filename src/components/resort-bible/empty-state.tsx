/**
 * ResortBibleEmptyState - Guidance when no resorts match filters
 */
import { BookOpen, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ResortBibleEmptyStateProps {
  hasFilters?: boolean
  onClearFilters?: () => void
  onAddResort?: () => void
  className?: string
}

export function ResortBibleEmptyState({
  hasFilters,
  onClearFilters,
  onAddResort,
  className,
}: ResortBibleEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-secondary/30 px-8 py-16 text-center animate-fade-in',
        className
      )}
      role="status"
      aria-label="No resorts found"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
        <BookOpen className="h-8 w-8 text-accent" />
      </div>
      <h3 className="font-serif text-xl font-semibold text-foreground">
        {hasFilters ? 'No resorts match your filters' : 'No resorts yet'}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {hasFilters
          ? 'Try broadening your search or clearing some filters to see more results.'
          : 'Add your first resort to build your directory. You can add manually or import from CSV.'}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {onAddResort && (
          <Button onClick={onAddResort} aria-label="Add new resort">
            <Plus className="h-4 w-4" />
            New Resort
          </Button>
        )}
        {hasFilters && onClearFilters && (
          <Button
            variant="outline"
            onClick={onClearFilters}
            aria-label="Clear filters"
          >
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  )
}
