/**
 * ClientDetailPage - Comprehensive 360-degree client profile
 * Tabs: Overview, Bookings, Documents, Preferences, Communications, Billing, Notes, Travel History
 */
import { useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import * as Tabs from '@radix-ui/react-tabs'
import { toast } from 'sonner'
import { useClientDetail } from '@/hooks/use-client-detail'
import {
  ProfileHeader,
  QuickActionsBar,
  TabNav,
  OverviewPanel,
  BookingsPanel,
  DocumentsPanel,
  PreferencesPanel,
  BillingPanel,
  NotesPanel,
  CommunicationsPanel,
  TravelHistoryPanel,
  VipFlagsPanel,
} from '@/components/client-detail'
import { Skeleton } from '@/components/ui/skeleton'

const TAB_ITEMS = [
  { value: 'overview', label: 'Overview' },
  { value: 'bookings', label: 'Bookings' },
  { value: 'documents', label: 'Documents' },
  { value: 'preferences', label: 'Preferences' },
  { value: 'communications', label: 'Communications' },
  { value: 'billing', label: 'Billing' },
  { value: 'notes', label: 'Notes' },
  { value: 'travel', label: 'Travel History' },
  { value: 'vip', label: 'VIP Flags' },
]

export function ClientDetail() {
  const { id } = useParams<{ id: string }>()
  const clientId = id ?? ''
  const [activeTab, setActiveTab] = useState('overview')

  const {
    profile,
    documents,
    notes,
    communications,
    bookings,
    travelHistory,
    vipFlags,
    isProfileLoading,
    error,
    clientDetailApi,
    invalidateAll,
  } = useClientDetail(clientId)

  const handleAddNote = useCallback(
    async (
      content: string,
      visibility: 'private' | 'team' | 'org',
      mentions?: string[]
    ) => {
      try {
        await clientDetailApi.createNote(clientId, {
          content,
          visibility,
          mentions,
        })
        toast.success('Note added')
        invalidateAll()
      } catch {
        toast.error('Failed to add note')
      }
    },
    [clientId, clientDetailApi, invalidateAll]
  )

  const handleUploadDocument = useCallback(
    async (type: 'passport' | 'visa' | 'other', file: File) => {
      try {
        const fileUrl = URL.createObjectURL(file)
        await clientDetailApi.uploadDocument(clientId, {
          type,
          fileUrl,
          expiryDate: undefined,
        })
        toast.success('Document uploaded')
        invalidateAll()
      } catch {
        toast.error('Failed to upload document')
      }
    },
    [clientId, clientDetailApi, invalidateAll]
  )

  const upcomingCount = (bookings ?? []).filter(
    (b) => b.status === 'confirmed' && b.checkOut && new Date(b.checkOut) >= new Date()
  ).length

  if (!clientId) {
    return (
      <div className="space-y-6 animate-fade-in">
        <p className="text-muted-foreground">Invalid client ID</p>
      </div>
    )
  }

  if (error && !isProfileLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <p className="font-medium text-destructive">Failed to load client</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <ProfileHeader
        clientId={clientId}
        profile={profile}
        onCall={() => toast.info('Call action')}
        onEmail={() => window.open(`mailto:${profile?.email ?? ''}`)}
        onMessage={() => toast.info('Message action')}
      />

      <QuickActionsBar
        clientId={clientId}
        onNewTask={() => toast.info('New task')}
        onSendProposal={() => toast.info('Send proposal')}
        onAddNote={() => setActiveTab('notes')}
        canEdit
      />

      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <TabNav
          tabs={TAB_ITEMS}
          value={activeTab}
          onValueChange={setActiveTab}
        />
        <Tabs.Content value="overview" className="mt-4">
          {isProfileLoading ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : (
            <OverviewPanel
              profile={profile}
              upcomingBookingsCount={upcomingCount}
              outstandingBalance={profile?.outstandingBalance ?? 0}
            />
          )}
        </Tabs.Content>

        <Tabs.Content value="bookings" className="mt-4">
          <BookingsPanel
            clientId={clientId}
            bookings={bookings ?? []}
            isLoading={isProfileLoading}
          />
        </Tabs.Content>

        <Tabs.Content value="documents" className="mt-4">
          <DocumentsPanel
            documents={documents ?? []}
            isLoading={isProfileLoading}
            onUpload={handleUploadDocument}
          />
        </Tabs.Content>

        <Tabs.Content value="preferences" className="mt-4">
          <PreferencesPanel profile={profile} />
        </Tabs.Content>

        <Tabs.Content value="communications" className="mt-4">
          <CommunicationsPanel
            communications={communications ?? []}
            isLoading={isProfileLoading}
          />
        </Tabs.Content>

        <Tabs.Content value="billing" className="mt-4">
          <BillingPanel profile={profile} />
        </Tabs.Content>

        <Tabs.Content value="notes" className="mt-4">
          <NotesPanel
            notes={notes ?? []}
            isLoading={isProfileLoading}
            onCreateNote={handleAddNote}
            canEdit
          />
        </Tabs.Content>

        <Tabs.Content value="travel" className="mt-4">
          <TravelHistoryPanel
            travelHistory={travelHistory ?? []}
            bookings={bookings ?? []}
            isLoading={isProfileLoading}
          />
        </Tabs.Content>

        <Tabs.Content value="vip" className="mt-4">
          <VipFlagsPanel
            vipFlags={vipFlags ?? []}
            isLoading={isProfileLoading}
          />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}
