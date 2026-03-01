/**
 * ResortDetail - Full resort profile with all sections
 * Overview, Rooms, Perks & Policies, Media, Contacts, Internal Notes
 * Tab state persisted in URL for shareable links
 * Runtime safety: all arrays guarded with ensureArray
 */
import { useMemo } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { resortBibleApi } from '@/api/resort-bible'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import * as Tabs from '@radix-ui/react-tabs'
import { useResortDetail } from '@/hooks/use-resort-detail'
import { ensureArray } from '@/lib/resort-bible-utils'
import {
  ResortHeader,
  MediaGallery,
  MediaGalleryInlineEditor,
  ResortRoomsTable,
  ResortPoliciesPanel,
  ContactsList,
  InternalNotesPanel,
  ResortLoadingSkeleton,
  OverviewCard,
  ResortBibleDirectorySearchWidget,
} from '@/components/resort-bible'

const TAB_ITEMS = [
  { value: 'overview', label: 'Overview' },
  { value: 'rooms', label: 'Rooms' },
  { value: 'perks-policies', label: 'Perks & Policies' },
  { value: 'media', label: 'Media' },
  { value: 'contacts', label: 'Contacts' },
  { value: 'internal-notes', label: 'Internal Notes' },
] as const

const TAB_VALUES = TAB_ITEMS.map((t) => t.value)

export function ResortDetail() {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const { resort, isLoading, refetch } = useResortDetail(id ?? undefined)

  const activeTab = useMemo((): (typeof TAB_ITEMS)[number]['value'] => {
    const tab = searchParams.get('tab')
    const valid = TAB_VALUES.find((v) => v === tab)
    return (valid ?? 'overview') as (typeof TAB_ITEMS)[number]['value']
  }, [searchParams])

  const setActiveTab = (value: (typeof TAB_ITEMS)[number]['value']) => {
    const tab = TAB_VALUES.includes(value) ? value : 'overview'
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (tab === 'overview') {
        next.delete('tab')
      } else {
        next.set('tab', tab)
      }
      return next
    })
  }

  const media = ensureArray(resort?.media)
  const roomTypes = ensureArray(resort?.roomTypes)
  const ratings = ensureArray(resort?.internalRatings)
  const panelNotes = ensureArray(resort?.panelNotes)

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
      <ResortHeader
        resort={resort}
        onCheckAvailability={() => toast.info('Check availability coming soon')}
        onRequestQuote={() => toast.info('Request quote coming soon')}
      />

      <div className="relative h-64 overflow-hidden rounded-lg bg-secondary transition-shadow hover:shadow-card">
        {media[0]?.url ? (
          (media[0].type ?? 'image') === 'video' ? (
            <video
              src={media[0].url}
              className="h-full w-full object-cover"
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            <img
              src={media[0].url}
              alt={media[0].caption ?? resort.name}
              className="h-full w-full object-cover"
            />
          )
        ) : (
          <div className="flex h-full w-full items-center justify-center text-6xl font-serif text-muted-foreground">
            {resort.name?.charAt(0) ?? '?'}
          </div>
        )}
      </div>

      <Tabs.Root
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as (typeof TAB_ITEMS)[number]['value'])}
        className="space-y-4"
      >
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
              aria-selected={activeTab === tab.value}
            >
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="overview">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <OverviewCard
                resort={resort}
                onCheckAvailability={() => toast.info('Check availability coming soon')}
                onProposeItinerary={() => toast.info('Propose itinerary coming soon')}
                onCreateTask={() => toast.info('Create task coming soon')}
              />
            </div>
            <div className="lg:col-span-1">
              <ResortBibleDirectorySearchWidget
                excludeResortId={resort.id}
                maxResults={6}
              />
            </div>
          </div>
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
          <Card className="transition-shadow duration-300 hover:shadow-card-hover">
            <CardHeader>
              <CardTitle>Media gallery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MediaGallery items={media} resortName={resort.name} />
              <MediaGalleryInlineEditor
                items={media}
                resortName={resort.name}
                canEdit
                onItemsChange={async (next) => {
                  try {
                    await resortBibleApi.updateResort(resort.id, { media: next })
                    toast.success('Media updated')
                    refetch()
                  } catch {
                    toast.error('Failed to update media')
                  }
                }}
              />
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
