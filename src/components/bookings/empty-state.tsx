/**
 * BookingsEmptyState - Guidance when no bookings match or exist
 */
import { Calendar, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export interface BookingsEmptyStateProps {
  hasFilters?: boolean
  onClearFilters?: () => void
}

export function BookingsEmptyState({
  hasFilters,
  onClearFilters,
}: BookingsEmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-secondary/30 px-8 py-16 text-center animate-fade-in"
      role="status"
      aria-label="No bookings found"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
        <Calendar className="h-8 w-8 text-accent" />
      </div>
      <h3 className="font-serif text-xl font-semibold text-foreground">
        {hasFilters ? 'No bookings match your filters' : 'No bookings yet'}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {hasFilters
          ? 'Try broadening your search or clearing some filters to see more results.'
          : 'Create your first booking to get started. You can add bookings manually or import from external systems.'}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild aria-label="Create new booking">
          <Link to="/dashboard/bookings/new">
            <Plus className="h-4 w-4" />
            New Booking
          </Link>
        </Button>
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
