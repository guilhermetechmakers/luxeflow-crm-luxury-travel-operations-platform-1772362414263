/**
 * OverviewCard - Short blurb, seasonality snapshot, partners badges, key stats
 * Displays rating, last updated, quick actions (Check Availability, Propose Itinerary, Create Task)
 */
import { MapPin, Clock, Users, Utensils, Star, Calendar, FileText, ListTodo } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ensureArray } from '@/lib/resort-bible-utils'
import type { Resort, DiningOption } from '@/types/resort-bible'
import { PartnerBadges } from './partner-badges'
import { cn } from '@/lib/utils'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatSeasonality(
  seasonality: { startMonth: number; endMonth: number; notes?: string }[]
): string {
  if (!seasonality?.length) return '—'
  return seasonality
    .map((s) => {
      const range = `${MONTHS[(s.startMonth ?? 1) - 1]}–${MONTHS[(s.endMonth ?? 12) - 1]}`
      return s.notes ? `${range} (${s.notes})` : range
    })
    .join('; ')
}

function normalizeDining(dining: Resort['dining']): string[] {
  if (!dining) return []
  if (Array.isArray(dining)) {
    const first = dining[0]
    if (typeof first === 'string') return dining as string[]
    return (dining as DiningOption[]).flatMap((d) => d.options ?? [])
  }
  return []
}

function getLocationLabel(resort: Resort): string {
  const loc = resort?.location
  if (!loc) return ''
  return [loc.city, loc.region, loc.country].filter(Boolean).join(', ')
}

export interface OverviewCardProps {
  resort: Resort
  onCheckAvailability?: () => void
  onProposeItinerary?: () => void
  onCreateTask?: () => void
  className?: string
}

export function OverviewCard({
  resort,
  onCheckAvailability,
  onProposeItinerary,
  onCreateTask,
  className,
}: OverviewCardProps) {
  const seasonality = ensureArray(resort?.seasonality)
  const dining = normalizeDining(resort?.dining)
  const partners = ensureArray(resort?.partners)
  const ratings = ensureArray(resort?.internalRatings)
  const locationLabel = getLocationLabel(resort)
  const transferDisplay = Array.isArray(resort?.transferTimes)
    ? resort.transferTimes.join(' · ')
    : resort?.transferTime ?? '—'

  const avgRating =
    ratings.length > 0
      ? ratings.reduce((a, r) => a + (r?.rating ?? 0), 0) / ratings.length
      : null

  const lastUpdated = resort?.lastUpdated ?? resort?.updatedAt ?? resort?.createdAt

  return (
    <div className={cn('space-y-4', className)}>
      {(onCheckAvailability || onProposeItinerary || onCreateTask) && (
        <div className="flex flex-wrap gap-2">
          {onCheckAvailability && (
            <Button
              onClick={onCheckAvailability}
              className="bg-accent text-accent-foreground transition-transform hover:scale-[1.02] hover:bg-accent/90"
              aria-label="Check availability"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Check Availability
            </Button>
          )}
          {onProposeItinerary && (
            <Button
              variant="outline"
              onClick={onProposeItinerary}
              className="transition-transform hover:scale-[1.02]"
              aria-label="Propose itinerary"
            >
              <FileText className="mr-2 h-4 w-4" />
              Propose Itinerary
            </Button>
          )}
          {onCreateTask && (
            <Button
              variant="outline"
              onClick={onCreateTask}
              className="transition-transform hover:scale-[1.02]"
              aria-label="Create task"
            >
              <ListTodo className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          )}
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="transition-shadow duration-200 hover:shadow-card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-5 w-5 text-accent" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-muted-foreground">{locationLabel || '—'}</p>
            {resort.location?.region && (
              <p className="text-sm text-muted-foreground">
                Region: {resort.location.region}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="transition-shadow duration-200 hover:shadow-card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5 text-accent" />
              Transfer time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{transferDisplay || '—'}</p>
          </CardContent>
        </Card>

        <Card className="transition-shadow duration-200 hover:shadow-card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5 text-accent" />
              Kids policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{resort.kidsPolicy ?? '—'}</p>
          </CardContent>
        </Card>

        <Card className="transition-shadow duration-200 hover:shadow-card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Utensils className="h-5 w-5 text-accent" />
              Dining
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dining.length === 0 ? (
              <p className="text-muted-foreground">—</p>
            ) : (
              <ul className="list-disc space-y-1 pl-4 text-muted-foreground" role="list">
                {dining.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {seasonality.length > 0 && (
        <Card className="transition-shadow duration-200 hover:shadow-card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-5 w-5 text-accent" />
              Seasonality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {formatSeasonality(seasonality)}
            </p>
          </CardContent>
        </Card>
      )}

      {ensureArray(resort?.perks).length > 0 && (
        <Card className="transition-shadow duration-200 hover:shadow-card-hover">
          <CardHeader>
            <CardTitle>Perks & inclusions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-4 text-muted-foreground" role="list">
              {ensureArray(resort?.perks).map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {((Array.isArray(resort?.restrictions) && resort.restrictions.length > 0) ||
        (typeof resort?.restrictions === 'string' && resort.restrictions)) && (
        <Card className="transition-shadow duration-200 hover:shadow-card-hover">
          <CardHeader>
            <CardTitle>Restrictions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {Array.isArray(resort?.restrictions)
                ? resort.restrictions.join('; ')
                : resort?.restrictions}
            </p>
          </CardContent>
        </Card>
      )}

      {(partners.length > 0 || avgRating != null || lastUpdated) && (
        <Card className="transition-shadow duration-200 hover:shadow-card-hover">
          <CardHeader>
            <CardTitle>Key stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {partners.length > 0 && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Partners
                </p>
                <div className="mt-2">
                  <PartnerBadges partners={partners} />
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-4">
              {avgRating != null && (
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-supporting text-supporting" />
                  <span className="font-semibold">{avgRating.toFixed(1)}</span>
                  <span className="text-muted-foreground">
                    / 5 ({ratings.length} rating{ratings.length !== 1 ? 's' : ''})
                  </span>
                </div>
              )}
              {lastUpdated && (
                <p className="text-sm text-muted-foreground">
                  Last updated:{' '}
                  {new Date(lastUpdated).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  )
}
