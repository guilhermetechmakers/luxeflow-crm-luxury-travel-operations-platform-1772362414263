/**
 * BookingDetailPage - Full lifecycle-aware booking record
 * Header, timeline, itinerary, rates, payments, supplier refs, attachments, notes, approvals
 */
import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import * as Tabs from '@radix-ui/react-tabs'
import { toast } from 'sonner'
import { useBookingDetail } from '@/hooks/use-booking-detail'
import {
  BookingHeaderCard,
  TimelineComponent,
  ItineraryEditor,
  RatesPanel,
  PaymentScheduleTable,
  SupplierReferencesCard,
  AttachmentsGallery,
  InternalNotesCard,
  ApprovalsPanel,
  ActionsBar,
  BookingOperationsWidgets,
  DeadlinesSlaCard,
  ResortRoomPanel,
  RelatedEntitiesRail,
  ProposalHandoverGenerator,
} from '@/components/booking-detail'
import { cn } from '@/lib/utils'
import type { TimelineStageType } from '@/types/booking'

const STATUS_TO_TIMELINE: Record<string, TimelineStageType> = {
  quote: 'quote',
  confirmed: 'confirmed',
  pre_arrival: 'pre_arrival',
  in_stay: 'in_stay',
  completed: 'post_stay',
  post_stay: 'post_stay',
}

export function BookingDetail() {
  const { id } = useParams<{ id: string }>()
  const bookingId = id ?? ''
  const [activeTab, setActiveTab] = useState('summary')

  const {
    detail,
    timeline,
    itinerary,
    payments,
    attachments,
    notes,
    approvals,
    supplierRefs,
    isLoading,
    error,
    addNoteMutation,
    addAttachmentMutation,
    requestApprovalMutation,
    createInvoiceMutation,
    approvalActionMutation,
  } = useBookingDetail(bookingId)

  const currentStatusForTimeline =
    STATUS_TO_TIMELINE[detail?.status ?? ''] ?? 'quote'

  const handleSendProposal = useCallback(() => {
    toast.info('Send proposal action')
  }, [])

  const handleIssueInvoice = useCallback(async () => {
    try {
      await createInvoiceMutation.mutateAsync()
      toast.success('Invoice created')
    } catch {
      toast.error('Failed to create invoice')
    }
  }, [createInvoiceMutation])

  const handleRequestApproval = useCallback(async () => {
    try {
      await requestApprovalMutation.mutateAsync({})

      toast.success('Approval requested')
    } catch {
      toast.error('Failed to request approval')
    }
  }, [requestApprovalMutation])

  const handleCreateTask = useCallback(() => {
    toast.info('Create task action')
  }, [])

  const handleLinkMessage = useCallback(() => {
    toast.info('Link message action')
  }, [])

  const handleAddNote = useCallback(
    async (content: string) => {
      try {
        await addNoteMutation.mutateAsync(content)
        toast.success('Note added')
      } catch {
        toast.error('Failed to add note')
      }
    },
    [addNoteMutation]
  )

  const handleAddAttachment = useCallback(
    async (file: { filename: string; url: string; type: string }) => {
      try {
        await addAttachmentMutation.mutateAsync(file)
        toast.success('Attachment uploaded')
      } catch {
        toast.error('Failed to upload attachment')
      }
    },
    [addAttachmentMutation]
  )

  const handleApprove = useCallback(
    async (approvalId: string) => {
      try {
        await approvalActionMutation.mutateAsync({ approvalId, action: 'approve' })
        toast.success('Approval granted')
      } catch {
        toast.error('Failed to approve')
      }
    },
    [approvalActionMutation]
  )

  const handleDeny = useCallback(
    async (approvalId: string) => {
      try {
        await approvalActionMutation.mutateAsync({ approvalId, action: 'deny' })
        toast.success('Approval denied')
      } catch {
        toast.error('Failed to deny')
      }
    },
    [approvalActionMutation]
  )

  const handleCreatePayment = useCallback(() => {
    toast.info('Add payment milestone dialog')
  }, [])

  if (!bookingId) {
    return (
      <div className="space-y-6 animate-fade-in">
        <p className="text-muted-foreground">Invalid booking ID</p>
      </div>
    )
  }

  if (error && !isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <p className="font-medium text-destructive">Failed to load booking</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in lg:flex-row">
      <main className="min-w-0 flex-1 space-y-6">
      <BookingHeaderCard
        detail={detail}
        isLoading={isLoading}
        onSendProposal={handleSendProposal}
        onIssueInvoice={handleIssueInvoice}
        onRequestApproval={handleRequestApproval}
      />

      <BookingOperationsWidgets
        bookingId={bookingId}
        detail={detail}
        payments={payments}
        approvals={approvals}
        deadlines={detail?.deadlines ?? []}
      />

      <ActionsBar
        onSendProposal={handleSendProposal}
        onIssueInvoice={handleIssueInvoice}
        onRequestApproval={handleRequestApproval}
        onCreateTask={handleCreateTask}
        onLinkMessage={handleLinkMessage}
        onAddNote={() => setActiveTab('notes')}
        isCreatingInvoice={createInvoiceMutation.isPending}
      />

      <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <Tabs.List
          className="flex gap-2 border-b border-border"
          role="tablist"
          aria-label="Booking sections"
        >
          <Tabs.Trigger
            value="summary"
            className={cn(
              'border-b-2 border-transparent px-4 py-2 text-sm font-medium transition-colors',
              'data-[state=active]:border-accent data-[state=active]:text-accent'
            )}
          >
            Summary
          </Tabs.Trigger>
          <Tabs.Trigger
            value="itinerary"
            className={cn(
              'border-b-2 border-transparent px-4 py-2 text-sm font-medium transition-colors',
              'data-[state=active]:border-accent data-[state=active]:text-accent'
            )}
          >
            Itinerary
          </Tabs.Trigger>
          <Tabs.Trigger
            value="payments"
            className={cn(
              'border-b-2 border-transparent px-4 py-2 text-sm font-medium transition-colors',
              'data-[state=active]:border-accent data-[state=active]:text-accent'
            )}
          >
            Payments
          </Tabs.Trigger>
          <Tabs.Trigger
            value="documents"
            className={cn(
              'border-b-2 border-transparent px-4 py-2 text-sm font-medium transition-colors',
              'data-[state=active]:border-accent data-[state=active]:text-accent'
            )}
          >
            Documents
          </Tabs.Trigger>
          <Tabs.Trigger
            value="notes"
            className={cn(
              'border-b-2 border-transparent px-4 py-2 text-sm font-medium transition-colors',
              'data-[state=active]:border-accent data-[state=active]:text-accent'
            )}
          >
            Notes
          </Tabs.Trigger>
          <Tabs.Trigger
            value="approvals"
            className={cn(
              'border-b-2 border-transparent px-4 py-2 text-sm font-medium transition-colors',
              'data-[state=active]:border-accent data-[state=active]:text-accent'
            )}
          >
            Approvals
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="summary" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <ResortRoomPanel
              detail={detail}
              isLoading={isLoading}
              canEdit={false}
            />
            <TimelineComponent
              stages={timeline}
              currentStatus={currentStatusForTimeline}
              canEdit={false}
            />
            <RatesPanel
              rates={detail?.rates ?? []}
              commission={detail?.commission ?? null}
              currency={detail?.currency ?? 'EUR'}
              totalAmount={detail?.total_amount ?? 0}
              isLoading={isLoading}
            />
            <SupplierReferencesCard
              suppliers={supplierRefs}
              isLoading={isLoading}
              canEdit={false}
            />
            <DeadlinesSlaCard
              deadlines={detail?.deadlines ?? []}
              isLoading={isLoading}
            />
            <ProposalHandoverGenerator
              detail={detail ?? null}
              isLoading={isLoading}
            />
          </div>
        </Tabs.Content>

        <Tabs.Content value="itinerary" className="mt-4">
          <ItineraryEditor
            days={itinerary}
            isLoading={isLoading}
            canEdit={false}
          />
        </Tabs.Content>

        <Tabs.Content value="payments" className="mt-4">
          <PaymentScheduleTable
            payments={payments}
            isLoading={isLoading}
            onCreatePayment={handleCreatePayment}
            canEdit
          />
        </Tabs.Content>

        <Tabs.Content value="documents" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <AttachmentsGallery
              attachments={attachments}
              isLoading={isLoading}
              onUpload={handleAddAttachment}
              canEdit
            />
          </div>
        </Tabs.Content>

        <Tabs.Content value="notes" className="mt-4">
          <InternalNotesCard
            notes={notes}
            isLoading={isLoading}
            onAddNote={handleAddNote}
            canEdit
          />
        </Tabs.Content>

        <Tabs.Content value="approvals" className="mt-4">
          <ApprovalsPanel
            approvals={approvals}
            isLoading={isLoading}
            onRequestApproval={handleRequestApproval}
            onApprove={handleApprove}
            onDeny={handleDeny}
            canEdit
          />
        </Tabs.Content>
      </Tabs.Root>
      </main>

      <aside className="hidden w-72 shrink-0 lg:block">
        <div className="sticky top-24">
          <RelatedEntitiesRail
            detail={detail}
            tasks={[]}
            proposals={[]}
            isLoading={isLoading}
          />
        </div>
      </aside>
    </div>
  )
}
