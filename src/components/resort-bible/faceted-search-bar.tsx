/**
 * FacetedSearchBar - Global search with optional advanced filter builder
 */
import { Search, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface FacetedSearchBarProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  onAdvancedClick?: () => void
  showAdvanced?: boolean
  placeholder?: string
  className?: string
}

export function FacetedSearchBar({
  searchQuery,
  onSearchChange,
  onAdvancedClick,
  showAdvanced = false,
  placeholder = 'Search resorts by name, location, tags...',
  className,
}: FacetedSearchBarProps) {
  return (
    <div className={cn('flex flex-col gap-2 sm:flex-row sm:items-center', className)}>
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
          aria-label="Search resorts"
        />
      </div>
      {onAdvancedClick && (
        <Button
          variant={showAdvanced ? 'default' : 'outline'}
          size="sm"
          onClick={onAdvancedClick}
          aria-label="Toggle advanced filters"
          aria-pressed={showAdvanced}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Advanced
        </Button>
      )}
    </div>
  )
}
