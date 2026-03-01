/**
 * AttachmentsGallery - Document gallery with preview, versioning, download links
 */
import { FileText, Download, Upload } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatShortDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { AttachmentDetail } from '@/types/booking'

export interface AttachmentsGalleryProps {
  attachments: AttachmentDetail[]
  isLoading?: boolean
  onUpload?: (file: { filename: string; url: string; type: string }) => void
  canEdit?: boolean
}

const TYPE_LABELS: Record<string, string> = {
  contract: 'Contract',
  itinerary: 'Itinerary',
  terms: 'Terms',
  other: 'Document',
}

export function AttachmentsGallery({
  attachments = [],
  isLoading = false,
  onUpload,
  canEdit = false,
}: AttachmentsGalleryProps) {
  const list = attachments ?? []

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Attachments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-lg bg-secondary/50"
                aria-hidden
              />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Attachments</CardTitle>
          {canEdit && onUpload && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = '.pdf,.doc,.docx,.xls,.xlsx'
                input.onchange = () => {
                  const file = input.files?.[0]
                  if (file) {
                    const url = URL.createObjectURL(file)
                    onUpload({
                      filename: file.name,
                      url,
                      type: 'other',
                    })
                  }
                }
                input.click()
              }}
            >
              <Upload className="h-4 w-4" aria-hidden />
              Upload
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground" aria-hidden />
            <p className="mt-4 text-muted-foreground">No attachments yet</p>
            {canEdit && onUpload && (
              <p className="mt-1 text-sm text-muted-foreground">
                Upload contracts, itineraries, or other documents
              </p>
            )}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(list ?? []).map((att) => (
              <div
                key={att.id}
                className={cn(
                  'flex items-start gap-3 rounded-lg border border-border p-4 transition-all duration-200',
                  'hover:border-accent/30'
                )}
              >
                <div className="shrink-0 rounded bg-secondary p-2">
                  <FileText
                    className="h-5 w-5 text-muted-foreground"
                    aria-hidden
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{att.filename ?? 'Document'}</p>
                  <p className="text-xs text-muted-foreground">
                    {TYPE_LABELS[att.type ?? 'other'] ?? att.type}
                    {att.version ? ` · v${att.version}` : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {att.uploaded_by ?? 'Unknown'} ·{' '}
                    {formatShortDate(att.uploaded_at)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  aria-label={`Download ${att.filename}`}
                >
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={att.filename}
                  >
                    <Download className="h-4 w-4" aria-hidden />
                  </a>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
