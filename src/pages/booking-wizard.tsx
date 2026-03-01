/**
 * BookingCreateEditWizard - Full 7-step booking creation/editing wizard
 * Client, Resort & Room, Rates, Payment Schedule, Itinerary, Attachments, Review
 * Sticky header, progress bar, Save Draft at any step
 */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { bookingsApi } from '@/api/bookings'
import {
  ClientSelector,
  ResortRoomPicker,
  RatesAndCommission,
  PaymentScheduleEditor,
  ItineraryEditorStep,
  AttachmentsAndSuppliers,
  ReviewAndActions,
  WizardConflictsChecker,
} from '@/components/booking-wizard'
import { validateStep, canSaveAsQuote, canConfirmBooking } from '@/lib/booking-wizard-validation'
import { cn } from '@/lib/utils'
import type { BookingDraft } from '@/types/booking'

const STEPS = [
  'Client',
  'Resort & Room',
  'Rates & Commission',
  'Payment Schedule',
  'Itinerary & Transfers',
  'Attachments & Suppliers',
  'Review & Save',
]

const defaultDraft: BookingDraft = {
  client: undefined,
  resort: undefined,
  room_category: undefined,
  check_in: '',
  check_out: '',
  rate_plan: undefined,
  commission_model: undefined,
  payment_schedule: [],
  itinerary: [],
  attachments: [],
  supplier_references: [],
  currency: 'EUR',
}

export function BookingWizard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const { id } = useParams<{ id: string }>()
  const clientIdFromUrl = searchParams.get('client') ?? undefined
  const mode: 'create' | 'edit' = id ? 'edit' : 'create'

  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<BookingDraft>(defaultDraft)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingEdit, setIsLoadingEdit] = useState(!!(mode === 'edit' && id))

  useEffect(() => {
    if (clientIdFromUrl && !draft.client?.id) {
      import('@/api/clients').then(({ clientsApi }) => {
        clientsApi.getClient(clientIdFromUrl).then((c) => {
          if (c) {
            setDraft((prev) => ({
              ...prev,
              client: {
                id: c.id,
                firstName: c.firstName ?? '',
                lastName: c.lastName ?? '',
                email: c.email ?? undefined,
                phone: c.phone ?? undefined,
                vip: c.vip ?? false,
                family: c.family ?? false,
                country: c.country ?? undefined,
                notes: c.notes ?? undefined,
              },
            }))
          }
        })
      })
    }
  }, [clientIdFromUrl])

  useEffect(() => {
    if (mode === 'edit' && id) {
      setIsLoadingEdit(true)
      bookingsApi
        .getBookingDetail(id)
        .then((detail) => {
          if (detail) {
            setDraft({
              id: detail.id,
              client: detail.client
                ? {
                    id: detail.client.id,
                    firstName: detail.client.name.split(' ')[0] ?? '',
                    lastName: detail.client.name.split(' ').slice(1).join(' ') ?? '',
                  }
                : null,
              resort: detail.resort
                ? {
                    id: detail.resort.id,
                    name: detail.resort.name,
                    location: detail.resort.location,
                    transfer_time_minutes: detail.resort.transfer_time_minutes,
                  }
                : null,
              room_category: detail.room_category ?? null,
              check_in: detail.check_in ?? '',
              check_out: detail.check_out ?? '',
              rate_plan: (detail.rates ?? [])[0] ?? null,
              commission_model: detail.commission ?? null,
              payment_schedule: (detail.payments ?? []).map((p) => ({
                id: p.id,
                milestone: p.milestone,
                due_date: p.due_date,
                amount: p.amount,
                currency: p.currency,
                status: p.status,
              })),
              itinerary: detail.itinerary ?? [],
              attachments: (detail.attachments ?? []).map((a) => ({
                id: a.id,
                filename: a.filename,
                url: a.url,
                type: a.type,
              })),
              supplier_references: (detail.supplier_references ?? []).map((s) => ({
                id: s.id,
                supplier_name: s.supplier_name ?? '',
                reference_code: s.reference_numbers,
                contact: s.contact,
                notes: '',
              })),
              currency: detail.currency ?? 'EUR',
            })
          }
        })
        .finally(() => setIsLoadingEdit(false))
    }
  }, [mode, id])

  const currentErrors = validateStep(step, draft)
  const stepErrorMessages = currentErrors.map((e) => e.message)

  const handleNext = useCallback(() => {
    if (currentErrors.length > 0) return
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
    }
  }, [step, currentErrors])

  const handleBack = useCallback(() => {
    if (step > 0) {
      setStep((s) => s - 1)
    } else {
      navigate('/dashboard/bookings')
    }
  }, [step, navigate])

  const savePayload = useCallback(() => {
    const payload = {
      client_id: draft.client?.id,
      resort_id: draft.resort?.id,
      room_category_id: draft.room_category?.id,
      check_in: draft.check_in,
      check_out: draft.check_out,
      rate_plan_id: draft.rate_plan?.id,
      commission: draft.commission_model,
      payment_schedule: draft.payment_schedule,
      itinerary: draft.itinerary,
      attachments: draft.attachments,
      supplier_references: draft.supplier_references,
      currency: draft.currency,
    }
    return payload
  }, [draft])

  const handleSaveDraft = useCallback(async () => {
    setIsSaving(true)
    try {
      let result
      if (mode === 'edit' && id) {
        result = await bookingsApi.updateBooking(id, savePayload())
      } else {
        result = await bookingsApi.createBooking(draft)
      }
      if (result) {
        toast.success('Draft saved')
        queryClient.invalidateQueries({ queryKey: ['bookings'] })
        navigate(`/dashboard/bookings/${result.id}`)
      } else {
        toast.error('Failed to save draft')
      }
    } catch {
      toast.error('Failed to save draft')
    } finally {
      setIsSaving(false)
    }
  }, [draft, mode, id, savePayload, navigate, queryClient])

  const handleSaveAsQuote = useCallback(async () => {
    if (!canSaveAsQuote(draft)) return
    setIsSaving(true)
    try {
      let result
      if (mode === 'edit' && id) {
        result = await bookingsApi.updateBooking(id, { ...savePayload(), status: 'quote' })
      } else {
        result = await bookingsApi.createBooking({ ...draft })
      }
      if (result) {
        toast.success('Saved as quote')
        queryClient.invalidateQueries({ queryKey: ['bookings'] })
        navigate(`/dashboard/bookings/${result.id}`)
      } else {
        toast.error('Failed to save quote')
      }
    } catch {
      toast.error('Failed to save quote')
    } finally {
      setIsSaving(false)
    }
  }, [draft, mode, id, savePayload, navigate, queryClient])

  const handleConfirmBooking = useCallback(async () => {
    if (!canConfirmBooking(draft)) return
    setIsSaving(true)
    try {
      let result
      if (mode === 'edit' && id) {
        result = await bookingsApi.updateBooking(id, { ...savePayload(), status: 'confirmed' })
      } else {
        result = await bookingsApi.createBooking({ ...draft })
      }
      if (result) {
        toast.success('Booking confirmed')
        queryClient.invalidateQueries({ queryKey: ['bookings'] })
        navigate(`/dashboard/bookings/${result.id}`)
      } else {
        toast.error('Failed to confirm booking')
      }
    } catch {
      toast.error('Failed to confirm booking')
    } finally {
      setIsSaving(false)
    }
  }, [draft, mode, id, savePayload, navigate, queryClient])

  if (isLoadingEdit) {
    return (
      <div className="mx-auto max-w-3xl animate-fade-in">
        <div className="flex items-center justify-center py-24">
          <div className="h-10 w-10 animate-pulse rounded-full bg-accent/30" aria-hidden />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      {/* Sticky header with progress */}
      <div className="sticky top-0 z-10 -mx-6 -mt-6 flex flex-col gap-4 border-b border-border bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            aria-label={step === 0 ? 'Cancel and go back' : 'Go back'}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-2xl font-semibold tracking-tight md:text-3xl">
              {mode === 'edit' ? 'Edit Booking' : 'New Booking'}
            </h1>
            <p className="text-sm text-muted-foreground">
              Step {step + 1} of {STEPS.length} · {STEPS[step]}
            </p>
          </div>
        </div>

        <div
          className="flex gap-1"
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-label="Wizard progress"
        >
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-all duration-300',
                i < step ? 'bg-accent' : i === step ? 'bg-accent/70' : 'bg-secondary'
              )}
            />
          ))}
        </div>

        {/* Mobile: step labels */}
        <div className="flex overflow-x-auto gap-2 pb-1 md:hidden">
          {(STEPS ?? []).map((label, i) => (
            <span
              key={i}
              className={cn(
                'shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors',
                i === step
                  ? 'bg-accent text-accent-foreground'
                  : i < step
                    ? 'bg-accent/20 text-accent'
                    : 'bg-secondary text-muted-foreground'
              )}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {step === 0 && (
          <ClientSelector
            value={draft.client ?? null}
            onChange={(client) => setDraft((prev) => ({ ...prev, client }))}
            errors={stepErrorMessages}
          />
        )}

        {step === 1 && (
          <ResortRoomPicker
            value={{
              resort: draft.resort ?? null,
              room: draft.room_category ?? null,
              checkIn: draft.check_in ?? '',
              checkOut: draft.check_out ?? '',
            }}
            onChange={(resort, room, checkIn, checkOut) =>
              setDraft((prev) => ({
                ...prev,
                resort,
                room_category: room,
                check_in: checkIn ?? prev.check_in,
                check_out: checkOut ?? prev.check_out,
              }))
            }
            errors={stepErrorMessages}
          />
        )}

        {step === 2 && (
          <RatesAndCommission
            resortId={draft.resort?.id}
            currency={draft.currency ?? 'EUR'}
            value={{
              ratePlan: draft.rate_plan ?? null,
              commission: draft.commission_model ?? null,
            }}
            onChange={(ratePlan, commission) =>
              setDraft((prev) => ({ ...prev, rate_plan: ratePlan, commission_model: commission }))
            }
            errors={stepErrorMessages}
          />
        )}

        {step === 3 && (
          <>
            <WizardConflictsChecker draft={draft} />
            <PaymentScheduleEditor
            checkIn={draft.check_in}
            checkOut={draft.check_out}
            totalAmount={draft.rate_plan?.amount ?? 0}
            currency={draft.currency}
            value={draft.payment_schedule}
            onChange={(schedule) => setDraft((prev) => ({ ...prev, payment_schedule: schedule }))}
            errors={stepErrorMessages}
          />
          </>
        )}

        {step === 4 && (
          <ItineraryEditorStep
            checkIn={draft.check_in}
            checkOut={draft.check_out}
            value={draft.itinerary}
            onChange={(itinerary) => setDraft((prev) => ({ ...prev, itinerary }))}
            errors={stepErrorMessages}
          />
        )}

        {step === 5 && (
          <AttachmentsAndSuppliers
            attachments={draft.attachments}
            supplierReferences={draft.supplier_references}
            onAttachmentsChange={(attachments) => setDraft((prev) => ({ ...prev, attachments }))}
            onSuppliersChange={(supplier_references) =>
              setDraft((prev) => ({ ...prev, supplier_references }))
            }
            errors={stepErrorMessages}
          />
        )}

        {step === 6 && (
          <ReviewAndActions
            draft={draft}
            isSaving={isSaving}
            onSaveDraft={handleSaveDraft}
            onSaveAsQuote={handleSaveAsQuote}
            onConfirmBooking={handleConfirmBooking}
            canSaveAsQuote={canSaveAsQuote(draft)}
            canConfirm={canConfirmBooking(draft)}
          />
        )}
      </div>

      {step < 6 && (
        <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:justify-between">
          <Button variant="outline" onClick={handleBack} className="w-full sm:w-auto">
            {step === 0 ? 'Cancel' : 'Back'}
          </Button>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              <Save className="h-4 w-4" aria-hidden />
              Save Draft
            </Button>
            <Button
              onClick={handleNext}
              disabled={currentErrors.length > 0}
              className="w-full transition-all duration-200 hover:scale-[1.02] hover:shadow-md sm:w-auto"
            >
              {step === STEPS.length - 2 ? 'Review' : 'Next'}
              {step === STEPS.length - 2 ? (
                <Check className="h-4 w-4" aria-hidden />
              ) : (
                <ArrowRight className="h-4 w-4" aria-hidden />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
