/**
 * ResortDetail - Full resort profile with all sections
 * Overview, Rooms, Perks & Policies, Media, Contacts, Internal Notes
 * Runtime safety: all arrays guarded with ensureArray
 */
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { resortBibleApi } from '@/api/resort-bible'
import { MapPin, Clock, Users, Utensils } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import * as Tabs from '@radix-ui/react-tabs'
import { useResortDetail } from '@/hooks/use-resort-detail'
import { ensureArray } from '@/lib/resort-bible-utils'
import {
  ResortHeader,
  MediaGallery,
  ResortRoomsTable,
  ResortPoliciesPanel,
  ContactsList,
  InternalNotesPanel,
  ResortLoadingSkeleton,
} from '@/components/resort-bible'
import type { Resort, DiningOption } from '@/types/resort-bible'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatSeasonality(
  seasonality: { startMonth: number; endMonth: number; notes?: string }[]
): string {
  if (!seasonality?.length) return '—'
  return seasonality
    .map((s) => {
      const range = `${MONTHS[s.startMonth - 1]}–${MONTHS[s.endMonth - 1]}`
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

const TAB_ITEMS = [
  { value: 'overview', label: 'Overview' },
  { value: 'rooms', label: 'Rooms' },
  { value: 'perks-policies', label: 'Perks & Policies' },
  { value: 'media', label: 'Media' },
  { value: 'contacts', label: 'Contacts' },
  { value: 'internal-notes', label: 'Internal Notes' },
] as const

export function ResortDetail() {
  const { id } = useParams<{ id: string }>()
  const { resort, isLoading, refetch } = useResortDetail(id ?? undefined)

  const media = ensureArray(resort?.media)
  const roomTypes = ensureArray(resort?.roomTypes)
  const seasonality = ensureArray(resort?.seasonality)
  const dining = normalizeDining(resort?.dining)
  const perks = ensureArray(resort?.perks)
  const ratings = ensureArray(resort?.internalRatings)
  const panelNotes = ensureArray(resort?.panelNotes)
  const locationLabel = resort ? getLocationLabel(resort) : ''

  if (!id) {
    return (
      <div className="space-y-6 animate-fade-in">
        <p className="text-muted-foreground">Invalid resort ID</p>
        <Button asChild variant="outline">
          <Link to="/dashboard/resorts">Back to Resort Bible</Link>
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <ResortLoadingSkeleton variant="detail" />
      </div>
    )
  }

  if (!resort) {
    return (
      <div className="space-y-6 animate-fade-in">
        <p className="text-muted-foreground">Resort not found</p>
        <Button asChild variant="outline">
          <Link to="/dashboard/resorts">Back to Resort Bible</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <ResortHeader resort={resort} />

      <div className="relative h-64 overflow-hidden rounded-lg bg-secondary">
        {media[0]?.url ? (
          <img
            src={media[0].url}
            alt={media[0].caption ?? resort.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-6xl font-serif text-muted-foreground">
            {resort.name?.charAt(0) ?? '?'}
          </div>
        )}
      </div>

      <Tabs.Root defaultValue="overview" className="space-y-4">
        <Tabs.List
          className="flex flex-wrap gap-2 border-b border-border"
          role="tablist"
          aria-label="Resort detail sections"
        >
          {TAB_ITEMS.map((tab) => (
            <Tabs.Trigger
              key={tab.value}
              value={tab.value}
              className="border-b-2 border-transparent px-4 py-2 text-sm font-medium transition-colors hover:text-foreground data-[state=active]:border-accent data-[state=active]:text-accent"
              role="tab"
              aria-selected={tab.value === 'overview'}
            >
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="overview">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-muted-foreground">{locationLabel}</p>
                {resort.location?.region && (
                  <p className="text-sm text-muted-foreground">Region: {resort.location.region}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Transfer time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {Array.isArray(resort.transferTimes)
                    ? resort.transferTimes.join('; ')
                    : resort.transferTime ?? '—'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Kids policy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{resort.kidsPolicy ?? '—'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5" />
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
            <Card>
              <CardHeader>
                <CardTitle>Seasonality</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{formatSeasonality(seasonality)}</p>
              </CardContent>
            </Card>
          )}

          {perks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Perks & inclusions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-1 pl-4 text-muted-foreground" role="list">
                  {perks.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {resort.restrictions && (
            <Card>
              <CardHeader>
                <CardTitle>Restrictions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {Array.isArray(resort.restrictions)
                    ? resort.restrictions.join('; ')
                    : resort.restrictions}
                </p>
              </CardContent>
            </Card>
          )}

          {ratings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Internal rating</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {(
                    ratings.reduce((a, r) => a + (r?.rating ?? 0), 0) / ratings.length
                  ).toFixed(1)}{' '}
                  / 5 ({ratings.length} rating{ratings.length !== 1 ? 's' : ''})
                </p>
              </CardContent>
            </Card>
          )}
        </Tabs.Content>

        <Tabs.Content value="rooms">
          <ResortRoomsTable
            roomTypes={roomTypes}
            onViewRoomDetail={() => toast.info('Room detail view coming soon')}
          />
        </Tabs.Content>

        <Tabs.Content value="perks-policies">
          <ResortPoliciesPanel resort={resort} />
        </Tabs.Content>

        <Tabs.Content value="media">
          <Card>
            <CardHeader>
              <CardTitle>Media gallery</CardTitle>
            </CardHeader>
            <CardContent>
              <MediaGallery items={media} resortName={resort.name} />
            </CardContent>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="contacts">
          <ContactsList resort={resort} />
        </Tabs.Content>

        <Tabs.Content value="internal-notes">
          <InternalNotesPanel
            ratings={ratings}
            panelNotes={panelNotes}
            resortId={resort.id}
            resortName={resort.name}
            canAddNotes
            onAddNote={async (resortId: string, rating: number, notes: string) => {
              await resortBibleApi.addResortNote(resortId, rating, notes)
              toast.success('Note added')
              refetch()
            }}
          />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}
