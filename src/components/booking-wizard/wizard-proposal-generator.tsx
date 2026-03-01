/**
 * WizardProposalGenerator - Generate Proposal/Handover from draft before saving
 * Uses draft data converted to BookingDetail shape for template API
 */
import { useState } from 'react'
import { FileText, Download, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { templatesApi } from '@/api/templates'
import { draftToDetail } from '@/lib/draft-to-detail'
import type { BookingDraft } from '@/types/booking'
import type { TemplateFormat } from '@/api/templates'

export interface WizardProposalGeneratorProps {
  draft: BookingDraft
}

function hasMinData(draft: BookingDraft): boolean {
  if (!draft.client) return false
  if (!draft.resort) return false
  if (!draft.check_in || !draft.check_out) return false
  if (!draft.rate_plan) return false
  return true
}

export function WizardProposalGenerator({ draft }: WizardProposalGeneratorProps) {
  const [generating, setGenerating] = useState<
    { type: 'proposal' | 'handover'; format: TemplateFormat } | null
  >(null)

  const canGenerate = hasMinData(draft)

  const handleGenerate = async (
    type: 'proposal' | 'handover',
    format: TemplateFormat
  ) => {
    if (!canGenerate) {
      toast.error('Add client, resort, dates, and rate plan to generate documents')
      return
    }
    setGenerating({ type, format })
    try {
      const bookingData = draftToDetail(draft)
      const res = await templatesApi.renderTemplate({
        template_type: type,
        format,
        booking_data: bookingData,
      })
      if (res.status === 'success' && (res.url ?? res.blob_url)) {
        window.open(res.url ?? res.blob_url ?? '', '_blank')
        toast.success(`${type === 'proposal' ? 'Proposal' : 'Handover'} generated`)
      } else if (res.status === 'error') {
        toast.error(res.error ?? 'Failed to generate document')
      } else {
        toast.info('Document generation started. Download link will be available when ready.')
      }
    } catch {
      toast.error('Failed to generate document')
    } finally {
      setGenerating(null)
    }
  }

  const isGenerating = generating !== null

  return (
    <Card className="transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif text-lg">
          <FileText className="h-5 w-5 text-accent" aria-hidden />
          Generate Documents
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Create Proposal or Handover (DOCX/PDF) from current draft before saving.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {!canGenerate && (
          <p className="text-sm text-muted-foreground">
            Complete client, resort, dates, and rate plan to enable document generation.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!canGenerate || isGenerating}
            onClick={() => handleGenerate('proposal', 'pdf')}
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
            disabled={!canGenerate || isGenerating}
            onClick={() => handleGenerate('proposal', 'docx')}
          >
            {generating?.type === 'proposal' && generating?.format === 'docx' ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Download className="h-4 w-4" aria-hidden />
            )}
            Proposal (DOCX)
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!canGenerate || isGenerating}
            onClick={() => handleGenerate('handover', 'pdf')}
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
            disabled={!canGenerate || isGenerating}
            onClick={() => handleGenerate('handover', 'docx')}
          >
            {generating?.type === 'handover' && generating?.format === 'docx' ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Download className="h-4 w-4" aria-hidden />
            )}
            Handover (DOCX)
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
