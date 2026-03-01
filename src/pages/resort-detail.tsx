/**
 * ResortDetail - Full resort profile with all sections
 * Location, transfer times, kids policy, dining, room types, seasonality,
 * partners, perks, restrictions, media gallery, supplier contacts, internal ratings
 */
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { resortBibleApi } from '@/api/resort-bible'
import { ArrowLeft, MapPin, Clock, Users, Utensils, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import * as Tabs from '@radix-ui/react-tabs'
import { useResortDetail } from '@/hooks/use-resort-detail'
import { ensureArray } from '@/lib/resort-utils'
import {
  MediaGallery,
  PartnerBadges,
  InternalRatingsPanel,
  ResortLoadingSkeleton,
} from '@/components/resort-bible'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatSeasonality(seasonality: { startMonth: number; endMonth: number; notes?: string }[]): string {
  if (!seasonality?.length) return '—'
  return seasonality
    .map((s) => {
      const range = `${MONTHS[s.startMonth - 1]}–${MONTHS[s.endMonth - 1]}`
      return s.notes ? `${range} (${s.notes})` : range
    })
    .join('; ')
}

export function ResortDetail() {
  const { id } = useParams<{ id: string }>()
  const { resort, isLoading, refetch } = useResortDetail(id ?? undefined)

  const locationLabel = resort?.location
    ? [resort.location.city, resort.location.region, resort.location.country].filter(Boolean).join(', ')
    : ''
  const media = ensureArray(resort?.media)
  const roomTypes = ensureArray(resort?.roomTypes)
  const seasonality = ensureArray(resort?.seasonality)
  const dining = ensureArray(resort?.dining)
  const perks = ensureArray(resort?.perks)
  const partners = ensureArray(resort?.partners)
  const ratings = ensureArray(resort?.internalRatings)

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild aria-label="Back to Resort Bible">
            <Link to="/dashboard/resorts">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-serif text-3xl font-semibold text-foreground">{resort.name}</h1>
            <p className="mt-1 text-muted-foreground">{locationLabel}</p>
            {partners.length > 0 && (
              <div className="mt-3">
                <PartnerBadges partners={partners} />
              </div>
            )}
          </div>
        </div>
      </div>

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
        <Tabs.List className="flex gap-2 border-b border-border">
          <Tabs.Trigger
            value="overview"
            className="border-b-2 border-transparent px-4 py-2 data-[state=active]:border-accent data-[state=active]:text-accent"
          >
            Overview
          </Tabs.Trigger>
          <Tabs.Trigger
            value="rooms"
            className="border-b-2 border-transparent px-4 py-2 data-[state=active]:border-accent data-[state=active]:text-accent"
          >
            Rooms
          </Tabs.Trigger>
          <Tabs.Trigger
            value="perks"
            className="border-b-2 border-transparent px-4 py-2 data-[state=active]:border-accent data-[state=active]:text-accent"
          >
            Perks
          </Tabs.Trigger>
          <Tabs.Trigger
            value="contacts"
            className="border-b-2 border-transparent px-4 py-2 data-[state=active]:border-accent data-[state=active]:text-accent"
          >
            Contacts
          </Tabs.Trigger>
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
                <p className="text-muted-foreground">{resort.transferTime ?? '—'}</p>
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

            <InternalRatingsPanel
              resortId={resort.id}
              resortName={resort.name}
              ratings={ratings}
              canAddNotes
              onAddNote={async (resortId: string, rating: number, notes: string) => {
                await resortBibleApi.addResortNote(resortId, rating, notes)
                toast.success('Note added')
                refetch()
              }}
            />
          </div>

          {dining.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  Dining
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
                  {dining.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

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

          {media.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Media gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <MediaGallery items={media} resortName={resort.name} />
              </CardContent>
            </Card>
          )}

          {resort.restrictions && (
            <Card>
              <CardHeader>
                <CardTitle>Restrictions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{resort.restrictions}</p>
              </CardContent>
            </Card>
          )}

        </Tabs.Content>

        <Tabs.Content value="rooms">
          <Card>
            <CardHeader>
              <CardTitle>Room types</CardTitle>
            </CardHeader>
            <CardContent>
              {roomTypes.length === 0 ? (
                <p className="text-muted-foreground">No room types defined</p>
              ) : (
                <div className="space-y-4">
                  {roomTypes.map((rt) => (
                    <div key={rt.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                      <h4 className="font-medium">{rt.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {rt.bedConfig && `Bed: ${rt.bedConfig}`}
                        {rt.maxOccupancy && ` · Max occupancy: ${rt.maxOccupancy}`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="perks">
          <Card>
            <CardHeader>
              <CardTitle>Perks & inclusions</CardTitle>
            </CardHeader>
            <CardContent>
              {perks.length === 0 ? (
                <p className="text-muted-foreground">No perks defined</p>
              ) : (
                <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
                  {perks.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="contacts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Supplier contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {partners.length === 0 ? (
                <p className="text-muted-foreground">No partner contacts</p>
              ) : (
                <div className="space-y-4">
                  {partners.map((p) => (
                    <div key={p.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                      <h4 className="font-medium">{p.name}</h4>
                      {p.contactInfo && (
                        <p className="text-sm text-muted-foreground">{p.contactInfo}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}
