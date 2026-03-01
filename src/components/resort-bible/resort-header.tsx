/**
 * ResortHeader - Resort name, location, map placeholder, transfer times, quick tags
 */
import { Link } from 'react-router-dom'
import { ArrowLeft, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ensureArray } from '@/lib/resort-bible-utils'
import type { Resort } from '@/types/resort-bible'
import { PartnerBadges } from './partner-badges'
import { cn } from '@/lib/utils'

export interface ResortHeaderProps {
  resort: Resort
  className?: string
}

function getLocationLabel(resort: Resort): string {
  const loc = resort?.location
  if (!loc) return ''
  const parts = [loc.city, loc.region, loc.country].filter(Boolean)
  return parts.join(', ')
}

export function ResortHeader({ resort, className }: ResortHeaderProps) {
  const locationLabel = getLocationLabel(resort)
  const tags = ensureArray(resort?.tags)
  const partners = ensureArray(resort?.partners)
  const transferDisplay = Array.isArray(resort?.transferTimes)
    ? resort.transferTimes.join(' · ')
    : resort?.transferTime ?? ''

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild aria-label="Back to Resort Bible">
            <Link to="/dashboard/resorts">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-serif text-3xl font-semibold text-foreground">{resort.name}</h1>
            {locationLabel && (
              <p className="mt-1 flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                {locationLabel}
              </p>
            )}
            {transferDisplay && (
              <p className="mt-0.5 text-sm text-muted-foreground">{transferDisplay}</p>
            )}
            {partners.length > 0 && (
              <div className="mt-3">
                <PartnerBadges partners={partners} />
              </div>
            )}
          </div>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-accent/15 px-3 py-1 text-sm text-accent"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
