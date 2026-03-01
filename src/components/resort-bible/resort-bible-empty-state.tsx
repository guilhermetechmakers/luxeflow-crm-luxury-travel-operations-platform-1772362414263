/**
 * ResortBibleEmptyState - Empty state when no resorts match filters
 */
import { BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ResortBibleEmptyStateProps {
  hasFilters: boolean
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
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 py-16 px-6 text-center',
        className
      )}
    >
      <BookOpen className="h-16 w-16 text-muted-foreground/50" aria-hidden />
      <h3 className="mt-4 font-serif text-lg font-semibold">
        {hasFilters ? 'No resorts match your filters' : 'No resorts yet'}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {hasFilters
          ? 'Try adjusting your filters or search query to see more results.'
          : 'Add your first resort to build your directory and start creating proposals.'}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {hasFilters && onClearFilters && (
          <Button variant="outline" onClick={onClearFilters}>
            Clear filters
          </Button>
        )}
        {onAddResort && (
          <Button onClick={onAddResort}>Add resort</Button>
        )}
      </div>
    </div>
  )
}
