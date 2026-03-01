/**
 * ClientsEmptyState - guidance and onboarding for adding clients
 */
import { Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface ClientsEmptyStateProps {
  onAddClient: () => void
  hasFilters?: boolean
  onClearFilters?: () => void
}

export function ClientsEmptyState({
  onAddClient,
  hasFilters,
  onClearFilters,
}: ClientsEmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-secondary/30 px-8 py-16 text-center animate-fade-in"
      role="status"
      aria-label="No clients found"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
        <Users className="h-8 w-8 text-accent" />
      </div>
      <h3 className="font-serif text-xl font-semibold text-foreground">
        {hasFilters ? 'No clients match your filters' : 'No clients yet'}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {hasFilters
          ? 'Try broadening your search or clearing some filters to see more results.'
          : 'Add your first client to get started. You can import contacts or add them manually.'}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button onClick={onAddClient} aria-label="Add new client">
          Add New Client
        </Button>
        {hasFilters && onClearFilters && (
          <Button variant="outline" onClick={onClearFilters} aria-label="Clear filters">
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  )
}
