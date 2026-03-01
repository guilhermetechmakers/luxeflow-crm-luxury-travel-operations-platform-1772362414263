/**
 * ResortDetailPreviewModal - Optional quick view of resort details
 * Opens on card click for rapid inspection without full navigation
 */
import { Link } from 'react-router-dom'
import { MapPin, Clock, Users, Star, Eye } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ensureArray } from '@/lib/resort-bible-utils'
import { cn } from '@/lib/utils'
import type { Resort } from '@/types/resort-bible'

function getLocationLabel(resort: Resort): string {
  const loc = resort?.location
  if (!loc) return ''
  return [loc.city, loc.region, loc.country].filter(Boolean).join(', ')
}

function getAverageRating(resort: Resort): number | null {
  const ratings = ensureArray(resort?.internalRatings)
  if (ratings.length === 0) return null
  const sum = ratings.reduce((a, r) => a + (r?.rating ?? 0), 0)
  return Math.round((sum / ratings.length) * 10) / 10
}

export interface ResortDetailPreviewModalProps {
  resort: Resort | null
  open: boolean
  onOpenChange: (open: boolean) => void
  className?: string
}

export function ResortDetailPreviewModal({
  resort,
  open,
  onOpenChange,
  className,
}: ResortDetailPreviewModalProps) {
  if (!resort) return null

  const locationLabel = getLocationLabel(resort)
  const rating = getAverageRating(resort)
  const media = ensureArray(resort?.media)
  const firstImage = media.find((m) => m?.url)
  const roomTypes = ensureArray(resort?.roomTypes)
  const perks = ensureArray(resort?.perks)
  const partners = ensureArray(resort?.partners)
  const tags = ensureArray(resort?.tags)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn('max-w-lg overflow-hidden p-0', className)}
        aria-describedby="resort-preview-description"
      >
        <div className="relative h-48 overflow-hidden bg-secondary">
          {firstImage?.url ? (
            <img
              src={firstImage.url}
              alt={firstImage.caption ?? resort.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl font-serif text-muted-foreground">
              {resort.name?.charAt(0) ?? '?'}
            </div>
          )}
          {rating != null && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-background/90 px-2 py-1 text-sm font-medium">
              <Star className="h-4 w-4 fill-supporting text-supporting" />
              {rating}
            </div>
          )}
        </div>
        <DialogHeader className="px-6 pt-4">
          <DialogTitle className="font-serif text-xl">{resort.name}</DialogTitle>
        </DialogHeader>
        <div id="resort-preview-description" className="space-y-4 px-6 pb-6">
          {locationLabel && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{locationLabel}</span>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {resort.transferTime && (
              <span className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs">
                <Clock className="h-3 w-3" />
                {resort.transferTime} transfer
              </span>
            )}
            {resort.kidsPolicy && (
              <span className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs">
                <Users className="h-3 w-3" />
                {resort.kidsPolicy}
              </span>
            )}
            {roomTypes.length > 0 && (
              <span className="rounded bg-secondary px-2 py-1 text-xs">
                {roomTypes.length} room type{roomTypes.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          {perks.length > 0 && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Perks
              </p>
              <p className="mt-1 text-sm">{perks.slice(0, 5).join(', ')}</p>
            </div>
          )}
          {partners.length > 0 && (
            <div className="flex flex-wrap gap-1">
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
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 6).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <Button asChild className="w-full" size="sm">
            <Link
              to={`/dashboard/resorts/${resort.id}`}
              onClick={() => onOpenChange(false)}
              aria-label={`View full details for ${resort.name}`}
            >
              <Eye className="mr-2 h-4 w-4" />
              View full details
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
