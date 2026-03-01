/**
 * ProposalHandoverGenerator - Generate DOCX/PDF proposals and handover docs from booking data
 * Templates populated from booking state; triggers API for document generation
 */
import { useState } from 'react'
import { FileText, Download, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { templatesApi } from '@/api/templates'
import type { BookingDetail } from '@/types/booking'
import type { TemplateFormat } from '@/api/templates'

export interface ProposalHandoverGeneratorProps {
  detail: BookingDetail | null
  isLoading?: boolean
  onGenerate?: (type: 'proposal' | 'handover', format: TemplateFormat) => void
}

export function ProposalHandoverGenerator({
  detail,
  isLoading = false,
  onGenerate,
}: ProposalHandoverGeneratorProps) {
  const [generating, setGenerating] = useState<
    { type: 'proposal' | 'handover'; format: TemplateFormat } | null
  >(null)

  const handleGenerate = async (
    type: 'proposal' | 'handover',
    format: TemplateFormat
  ) => {
    if (!detail) {
      toast.error('No booking data available')
      return
    }
    setGenerating({ type, format })
    try {
      onGenerate?.(type, format)
      const res = await templatesApi.renderTemplate({
        template_type: type,
        format,
        booking_data: detail,
      })
      if (res.status === 'success' && res.url) {
        window.open(res.url, '_blank')
        toast.success(`${type === 'proposal' ? 'Proposal' : 'Handover'} generated`)
      } else if (res.status === 'success' && res.blob_url) {
        window.open(res.blob_url, '_blank')
        toast.success(`${type === 'proposal' ? 'Proposal' : 'Handover'} generated`)
      } else if (res.status === 'error') {
        toast.error(res.error ?? 'Failed to generate document')
      } else {
        toast.info(
          'Document generation started. You will receive a download link when ready.'
        )
      }
    } catch {
      toast.error('Failed to generate document')
    } finally {
      setGenerating(null)
    }
  }

  const isDisabled = isLoading || !detail
  const isGenerating = generating !== null

  return (
    <Card className="transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif text-lg">
          <FileText className="h-5 w-5 text-accent" aria-hidden />
          Proposal & Handover
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Generate standardized Proposal or Handover documents (DOCX/PDF) from
          booking data.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isDisabled || isGenerating}
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
            disabled={isDisabled || isGenerating}
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
            disabled={isDisabled || isGenerating}
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
            disabled={isDisabled || isGenerating}
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
