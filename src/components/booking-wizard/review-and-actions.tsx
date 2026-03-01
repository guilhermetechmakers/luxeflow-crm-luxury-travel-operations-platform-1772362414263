/**
 * ReviewAndActions - Summary view; validation panel; Save Draft, Save as Quote, Confirm Booking
 */
import { useState } from 'react'
import { ChevronDown, ChevronRight, AlertCircle, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatShortDate } from '@/lib/format'
import type { BookingDraft } from '@/types/booking'
import { validateFull } from '@/lib/booking-wizard-validation'

export interface ReviewAndActionsProps {
  draft: BookingDraft
  isSaving?: boolean
  onSaveDraft: () => void
  onSaveAsQuote: () => void
  onConfirmBooking: () => void
  canSaveAsQuote: boolean
  canConfirm: boolean
}

const SECTION_KEYS = ['client', 'resort', 'rates', 'payments', 'itinerary', 'attachments'] as const

export function ReviewAndActions({
  draft,
  isSaving = false,
  onSaveDraft,
  onSaveAsQuote,
  onConfirmBooking,
  canSaveAsQuote,
  canConfirm,
}: ReviewAndActionsProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['client', 'resort', 'rates']))
  const validationErrors = validateFull(draft)

  const toggle = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const clientName = draft.client
    ? ('firstName' in draft.client && 'lastName' in draft.client
      ? `${(draft.client as { firstName?: string; lastName?: string }).firstName ?? ''} ${(draft.client as { firstName?: string; lastName?: string }).lastName ?? ''}`.trim()
      : (draft.client as { name?: string }).name ?? '') || 'Unknown'
    : '—'
  const resortName = draft.resort?.name ?? '—'
  const roomName = draft.room_category?.name ?? '—'
  const totalAmount = draft.rate_plan?.amount ?? 0
  const commission = draft.commission_model?.calculated_commission ?? 0
  const scheduleSum = (draft.payment_schedule ?? []).reduce((s, p) => s + (p.amount ?? 0), 0)
  const itineraryDays = (draft.itinerary ?? []).length
  const attachmentsCount = (draft.attachments ?? []).length
  const suppliersCount = (draft.supplier_references ?? []).length

  return (
    <div className="space-y-6">
      {validationErrors.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" aria-hidden />
              Validation Issues
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Fix the following before saving as quote or confirming:
            </p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {validationErrors.map((e, i) => (
                <li key={i} className="text-sm text-destructive">
                  {e.field ? `[${e.field}] ` : ''}{e.message}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card className="transition-all duration-200 hover:shadow-card-hover">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Review Summary</CardTitle>
          <p className="text-sm text-muted-foreground">
            Review all sections below. Save Draft anytime; Save as Quote or Confirm require validation.
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {SECTION_KEYS.map((key) => {
            const isExp = expanded.has(key)
            let title = ''
            let summary = ''
            switch (key) {
              case 'client':
                title = 'Client'
                summary = clientName
                break
              case 'resort':
                title = 'Resort & Room'
                summary = `${resortName}${roomName !== '—' ? ` · ${roomName}` : ''}`
                break
              case 'rates':
                title = 'Rates & Commission'
                summary = `${formatCurrency(totalAmount, draft.currency)} · Commission ${formatCurrency(commission, draft.currency)}`
                break
              case 'payments':
                title = 'Payment Schedule'
                summary = `${(draft.payment_schedule ?? []).length} milestones · ${formatCurrency(scheduleSum, draft.currency)}`
                break
              case 'itinerary':
                title = 'Itinerary'
                summary = `${itineraryDays} days · ${draft.check_in && draft.check_out ? `${formatShortDate(draft.check_in)} – ${formatShortDate(draft.check_out)}` : '—'}`
                break
              case 'attachments':
                title = 'Attachments & Suppliers'
                summary = `${attachmentsCount} attachments · ${suppliersCount} suppliers`
                break
              default:
                title = key
            }
            return (
              <div
                key={key}
                className="rounded-lg border border-border"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-secondary/30"
                  onClick={() => toggle(key)}
                  aria-expanded={isExp}
                >
                  {isExp ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  )}
                  <span className="font-medium">{title}</span>
                  <span className="text-sm text-muted-foreground truncate max-w-[50%]">{summary}</span>
                </button>
                {isExp && (
                  <div className="border-t border-border p-4 text-sm text-muted-foreground">
                    {summary}
                  </div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={onSaveDraft}
          disabled={isSaving}
        >
          {isSaving ? 'Saving…' : 'Save Draft'}
        </Button>
        <Button
          onClick={onSaveAsQuote}
          disabled={!canSaveAsQuote || isSaving}
        >
          <Check className="h-4 w-4" aria-hidden />
          Save as Quote
        </Button>
        <Button
          onClick={onConfirmBooking}
          disabled={!canConfirm || isSaving}
          className="bg-accent hover:bg-accent/90"
        >
          Confirm Booking
        </Button>
      </div>
    </div>
  )
}
