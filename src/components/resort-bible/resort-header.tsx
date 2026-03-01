/**
 * ResortHeader - Resort name, location map, partner badges, quick tags, action buttons
 * Actions: Check Availability, Request Quote, Share
 */
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, MapPin, Calendar, FileText, Share2, Map } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ensureArray } from '@/lib/resort-bible-utils'
import type { Resort } from '@/types/resort-bible'
import { PartnerBadges } from './partner-badges'
import { cn } from '@/lib/utils'

export interface ResortHeaderProps {
  resort: Resort
  showMapPlaceholder?: boolean
  onCheckAvailability?: (resortId: string) => void
  onRequestQuote?: (resortId: string) => void
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

export function ResortHeader({
  resort,
  showMapPlaceholder = true,
  onCheckAvailability,
  onRequestQuote,
  className,
}: ResortHeaderProps) {
  const locationLabel = getLocationLabel(resort)
  const tags = ensureArray(resort?.tags)
  const partners = ensureArray(resort?.partners)
  const transferDisplay = Array.isArray(resort?.transferTimes)
    ? resort.transferTimes.join(' · ')
    : resort?.transferTime ?? ''
  const mapUrl = resort?.location ? getMapEmbedUrl(resort.location) : null

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: resort.name,
        text: `${resort.name} - ${locationLabel}`,
        url: window.location.href,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-6">
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              asChild
              aria-label="Back to Resort Bible"
              className="shrink-0 transition-transform hover:scale-[1.02]"
            >
              <Link to="/dashboard/resorts">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="font-serif text-3xl font-semibold text-foreground md:text-4xl">
                {resort.name}
              </h1>
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

          <div className="flex flex-wrap gap-2">
            {onCheckAvailability && (
              <Button
                onClick={() => onCheckAvailability(resort.id)}
                className="bg-accent text-accent-foreground transition-transform hover:scale-[1.02] hover:bg-accent/90"
                aria-label="Check availability"
              >
                <Calendar className="h-4 w-4" />
                Check Availability
              </Button>
            )}
            {onRequestQuote && (
              <Button
                onClick={() => onRequestQuote(resort.id)}
                className="bg-accent text-accent-foreground transition-transform hover:scale-[1.02] hover:bg-accent/90"
                aria-label="Request quote"
              >
                <FileText className="h-4 w-4" />
                Request Quote
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleShare}
              aria-label="Share resort"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-accent/15 px-3 py-1 text-sm text-accent transition-colors hover:bg-accent/25"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {(mapUrl || (showMapPlaceholder && !mapUrl)) && (
          <div
            className="h-32 w-full shrink-0 overflow-hidden rounded-lg border border-border lg:h-40 lg:w-64"
            aria-label="Resort location map"
          >
            {mapUrl ? (
              <iframe
                title="Resort location"
                src={mapUrl}
                className="h-full w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <Map className="h-10 w-10" aria-hidden />
                  <span className="text-xs">Map placeholder</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
