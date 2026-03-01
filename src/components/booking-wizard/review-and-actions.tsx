/**
 * ReviewAndActions - Summary view; validation panel; conflicts/risk flags;
 * Proposal & Handover template generation; Save Draft, Save as Quote, Confirm Booking
 */
import { useState, useEffect, useCallback } from 'react'
import { ChevronDown, ChevronRight, AlertCircle, Check, FileText, Download, Loader2, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatShortDate } from '@/lib/format'
import { toast } from 'sonner'
import { templatesApi } from '@/api/templates'
import type { TemplateFormat } from '@/api/templates'
import type { BookingDraft } from '@/types/booking'
import { validateFull } from '@/lib/booking-wizard-validation'
import { runFullChecks, type ConflictItem } from '@/api/conflicts'
import { draftToDetail } from '@/lib/booking-utils'
import { cn } from '@/lib/utils'

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
  const [conflicts, setConflicts] = useState<ConflictItem[]>([])
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false)
  const [generating, setGenerating] = useState<{ type: 'proposal' | 'handover'; format: TemplateFormat } | null>(null)

  const validationErrors = validateFull(draft)

  const runConflictsCheck = useCallback(async () => {
    if (!draft.client?.id && !draft.check_in) return
    setIsCheckingConflicts(true)
    try {
      const items = await runFullChecks(draft)
      setConflicts(items ?? [])
    } catch {
      setConflicts([])
    } finally {
      setIsCheckingConflicts(false)
    }
  }, [draft])

  useEffect(() => {
    runConflictsCheck()
  }, [runConflictsCheck])

  const toggle = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const handleGenerateTemplate = async (type: 'proposal' | 'handover', format: TemplateFormat) => {
    const detail = draftToDetail(draft)
    setGenerating({ type, format })
    try {
      const res = await templatesApi.renderTemplate({
        template_type: type,
        format,
        booking_data: detail,
      })
      if (res.status === 'success' && (res.url ?? res.blob_url)) {
        window.open(res.url ?? res.blob_url ?? '', '_blank')
        toast.success(`${type === 'proposal' ? 'Proposal' : 'Handover'} generated`)
      } else if (res.status === 'error') {
        toast.error(res.error ?? 'Failed to generate document')
      } else {
        toast.info('Document generation started. You will receive a download link when ready.')
      }
    } catch {
      toast.error('Failed to generate document')
    } finally {
      setGenerating(null)
    }
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

  const errorConflicts = (conflicts ?? []).filter((c) => c.severity === 'error')
  const warningConflicts = (conflicts ?? []).filter((c) => c.severity === 'warning')
  const hasBlockingConflicts = errorConflicts.length > 0
  const canProceedDespiteWarnings = warningConflicts.length > 0 && errorConflicts.length === 0

  return (
    <div className="space-y-6">
      {validationErrors.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5 transition-all duration-200 hover:shadow-card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-lg text-destructive">
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

      {(conflicts ?? []).length > 0 && (
        <Card
          className={cn(
            'transition-all duration-200 hover:shadow-card-hover',
            hasBlockingConflicts ? 'border-destructive/30 bg-destructive/5' : 'border-amber-500/30 bg-amber-500/5'
          )}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-lg">
              {isCheckingConflicts ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden />
              ) : hasBlockingConflicts ? (
                <AlertCircle className="h-5 w-5 text-destructive" aria-hidden />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden />
              )}
              Conflicts & Risk Flags
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {hasBlockingConflicts
                ? 'Resolve conflicts before confirming. You cannot Confirm until all errors are fixed.'
                : canProceedDespiteWarnings
                  ? 'Warnings do not block confirmation, but review before proceeding.'
                  : 'No conflicts detected.'}
            </p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(conflicts ?? []).map((c) => (
                <li
                  key={c.id}
                  className={cn(
                    'flex flex-col gap-1 rounded-lg border p-3 text-sm',
                    c.severity === 'error'
                      ? 'border-destructive/30 bg-destructive/10 text-destructive'
                      : 'border-amber-500/30 bg-amber-500/10 text-amber-800'
                  )}
                >
                  <span className="font-medium">{c.message}</span>
                  {c.resolution && (
                    <span className="text-xs opacity-90">{c.resolution}</span>
                  )}
                </li>
              ))}
            </ul>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={runConflictsCheck}
              disabled={isCheckingConflicts}
            >
              {isCheckingConflicts ? 'Checking…' : 'Re-check Conflicts'}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="transition-all duration-200 hover:shadow-card-hover">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Proposal & Handover</CardTitle>
          <p className="text-sm text-muted-foreground">
            Generate standardized Proposal or Handover documents (DOCX/PDF) from current booking data.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={generating !== null}
              onClick={() => handleGenerateTemplate('proposal', 'pdf')}
            >
              {generating?.type === 'proposal' && generating?.format === 'pdf' ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Download className="h-4 w-4" aria-hidden />
              )}
              Proposal (PDF)
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={generating !== null}
              onClick={() => handleGenerateTemplate('proposal', 'docx')}
            >
              {generating?.type === 'proposal' && generating?.format === 'docx' ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <FileText className="h-4 w-4" aria-hidden />
              )}
              Proposal (DOCX)
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={generating !== null}
              onClick={() => handleGenerateTemplate('handover', 'pdf')}
            >
              {generating?.type === 'handover' && generating?.format === 'pdf' ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Download className="h-4 w-4" aria-hidden />
              )}
              Handover (PDF)
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={generating !== null}
              onClick={() => handleGenerateTemplate('handover', 'docx')}
            >
              {generating?.type === 'handover' && generating?.format === 'docx' ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <FileText className="h-4 w-4" aria-hidden />
              )}
              Handover (DOCX)
            </Button>
          </div>
        </CardContent>
      </Card>

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
                className="rounded-lg border border-border transition-colors hover:bg-secondary/20"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-secondary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onClick={() => toggle(key)}
                  aria-expanded={isExp}
                >
                  {isExp ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  )}
                  <span className="font-medium">{title}</span>
                  <span className="max-w-[50%] truncate text-sm text-muted-foreground">{summary}</span>
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
          className="transition-all duration-200 hover:scale-[1.02]"
        >
          {isSaving ? 'Saving…' : 'Save Draft'}
        </Button>
        <Button
          onClick={onSaveAsQuote}
          disabled={!canSaveAsQuote || isSaving || hasBlockingConflicts}
          className="transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
        >
          <Check className="h-4 w-4" aria-hidden />
          Save as Quote
        </Button>
        <Button
          onClick={onConfirmBooking}
          disabled={!canConfirm || isSaving || hasBlockingConflicts}
          className="bg-accent transition-all duration-200 hover:scale-[1.02] hover:bg-accent/90 hover:shadow-md"
        >
          Confirm Booking
        </Button>
      </div>
    </div>
  )
}
