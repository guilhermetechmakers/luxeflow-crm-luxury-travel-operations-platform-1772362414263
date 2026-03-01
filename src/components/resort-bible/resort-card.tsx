/**
 * ResortCard - Thumbnail, name, location, attributes, rating, partner badges, quick actions
 */
import { Link } from 'react-router-dom'
import { Eye, GitCompare, Star, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { ensureArray } from '@/lib/resort-bible-utils'
import type { Resort } from '@/types/resort-bible'

export interface ResortCardProps {
  resort: Resort
  selected?: boolean
  onToggleSelect?: (id: string) => void
  onAddToShortlist?: (id: string) => void
  onCompare?: (id: string) => void
  onExport?: (id: string) => void
  showCheckbox?: boolean
  className?: string
}

function getLocationLabel(resort: Resort): string {
  const loc = resort?.location
  if (!loc) return ''
  const parts = [loc.city, loc.region, loc.country].filter(Boolean)
  return parts.join(', ')
}

function getAverageRating(resort: Resort): number | null {
  const ratings = ensureArray(resort?.internalRatings)
  if (ratings.length === 0) return null
  const sum = ratings.reduce((a, r) => a + (r?.rating ?? 0), 0)
  return Math.round((sum / ratings.length) * 10) / 10
}

export function ResortCard({
  resort,
  selected,
  onToggleSelect,
  onAddToShortlist,
  onCompare,
  onExport,
  showCheckbox,
  className,
}: ResortCardProps) {
  const locationLabel = getLocationLabel(resort)
  const rating = getAverageRating(resort)
  const media = ensureArray(resort?.media)
  const firstImage = media.find((m) => m?.url)
  const tags = ensureArray(resort?.tags)
  const partners = ensureArray(resort?.partners)
  const roomTypes = ensureArray(resort?.roomTypes)

  return (
    <Card
      className={cn(
        'group overflow-hidden transition-all duration-300 hover:shadow-card-hover',
        selected && 'ring-2 ring-accent',
        className
      )}
    >
      <CardContent className="p-0">
        <div className="flex">
          {showCheckbox && onToggleSelect && (
            <div className="flex items-start p-3" onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={selected}
                onCheckedChange={() => onToggleSelect(resort.id)}
                aria-label={`Select ${resort.name}`}
              />
            </div>
          )}
          <Link to={`/dashboard/resorts/${resort.id}`} className="flex-1 min-w-0">
            <div className="relative h-40 overflow-hidden bg-secondary">
              {firstImage?.url ? (
                <img
                  src={firstImage.url}
                  alt={firstImage.caption ?? resort.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <span className="text-4xl font-serif">{resort.name?.charAt(0) ?? '?'}</span>
                </div>
              )}
              {rating != null && (
                <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-background/90 px-2 py-1 text-sm font-medium">
                  <Star className="h-4 w-4 fill-supporting text-supporting" />
                  {rating}
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-serif text-xl font-semibold text-foreground line-clamp-1">
                {resort.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{locationLabel}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {resort.kidsPolicy && (
                  <span className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                    {resort.kidsPolicy}
                  </span>
                )}
                {resort.transferTime && (
                  <span className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                    {resort.transferTime} transfer
                  </span>
                )}
                {roomTypes.length > 0 && (
                  <span className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                    {roomTypes.length} room type{roomTypes.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {partners.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {partners.slice(0, 3).map((p) => (
                    <span
                      key={p.id}
                      className="rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent"
                    >
                      {p.name}
                    </span>
                  ))}
                </div>
              )}
              {tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        </div>
        <div className="flex items-center justify-between border-t border-border px-4 py-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/dashboard/resorts/${resort.id}`} aria-label={`View ${resort.name}`}>
              <Eye className="h-4 w-4" />
              View
            </Link>
          </Button>
          <div className="flex gap-1">
            {onCompare && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onCompare(resort.id)}
                aria-label={`Compare ${resort.name}`}
              >
                <GitCompare className="h-4 w-4" />
              </Button>
            )}
            {onAddToShortlist && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onAddToShortlist(resort.id)}
                aria-label={`Add ${resort.name} to shortlist`}
              >
                <Star className="h-4 w-4" />
              </Button>
            )}
            {onExport && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={`Export ${resort.name}`}>
                    <Download className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onExport(resort.id)}>
                    Export CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
