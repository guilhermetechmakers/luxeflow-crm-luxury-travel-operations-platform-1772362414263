/**
 * LocationTransferPanel - Map snippet, transfer time estimates, transportation notes
 * Runtime safety: all arrays guarded
 */
import { MapPin, Clock, Car } from 'lucide-react'
import { ensureArray } from '@/lib/resort-bible-utils'
import type { Resort } from '@/types/resort-bible'
import { SectionCard } from './section-card'
import { cn } from '@/lib/utils'

export interface LocationTransferPanelProps {
  resort?: Resort | null
  className?: string
}

function getLocationLabel(resort: Resort): string {
  const loc = resort?.location
  if (!loc) return ''
  const parts = [loc.city, loc.region, loc.country].filter(Boolean)
  return parts.join(', ')
}

function getMapEmbedUrl(loc: Resort['location']): string | null {
  const coords = loc?.coordinates
  if (coords?.lat != null && coords?.lng != null) {
    return `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - 0.05}%2C${coords.lat - 0.05}%2C${coords.lng + 0.05}%2C${coords.lat + 0.05}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`
  }
  const city = loc?.city ?? ''
  const country = loc?.country ?? ''
  if (city || country) {
    const q = encodeURIComponent([city, country].filter(Boolean).join(', '))
    return `https://www.openstreetmap.org/export/embed.html?q=${q}&layer=mapnik`
  }
  return null
}

export function LocationTransferPanel({ resort, className }: LocationTransferPanelProps) {
  const transferTimes = ensureArray(resort?.transferTimes)
  const transferDisplay =
    transferTimes.length > 0
      ? transferTimes
      : resort?.transferTime
        ? [resort.transferTime]
        : []
  const locationLabel = resort ? getLocationLabel(resort) : ''
  const mapUrl = resort?.location ? getMapEmbedUrl(resort.location) : null

  return (
    <div className={cn('space-y-4', className)}>
      <SectionCard
        title="Location"
        icon={<MapPin className="h-5 w-5 text-accent" />}
      >
        <div className="space-y-3">
          {locationLabel && (
            <p className="text-muted-foreground">{locationLabel}</p>
          )}
          {resort?.location?.region && (
            <p className="text-sm text-muted-foreground">
              Region: {resort.location.region}
            </p>
          )}
          {mapUrl ? (
            <div className="aspect-video overflow-hidden rounded-md border border-border">
              <iframe
                title="Resort location map"
                src={mapUrl}
                className="h-full w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-md border border-dashed border-border bg-secondary text-muted-foreground">
              <MapPin className="h-12 w-12 opacity-50" />
              <span className="ml-2 text-sm">Map unavailable</span>
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="Transfer times"
        icon={<Clock className="h-5 w-5 text-accent" />}
      >
        <div className="space-y-2">
          {transferDisplay.length === 0 ? (
            <p className="text-muted-foreground">—</p>
          ) : (
            <ul className="space-y-1" role="list">
              {transferDisplay.map((t, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <Car className="h-4 w-4 shrink-0 text-accent" />
                  {t}
                </li>
              ))}
            </ul>
          )}
        </div>
      </SectionCard>
    </div>
  )
}
