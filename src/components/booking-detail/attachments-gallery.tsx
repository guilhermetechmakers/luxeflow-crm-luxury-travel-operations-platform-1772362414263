/**
 * AttachmentsGallery - Document gallery with preview, versioning, download links
 * Drag-and-drop upload with progress indicator
 */
import { useState, useCallback, useRef } from 'react'
import { FileText, Download, Upload } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatShortDate } from '@/lib/format'
import { validateUploadFile } from '@/lib/validation'
import { cn } from '@/lib/utils'
import type { AttachmentDetail } from '@/types/booking'

export interface AttachmentsGalleryProps {
  attachments: AttachmentDetail[]
  isLoading?: boolean
  onUpload?: (file: { filename: string; url: string; type: string }) => void | Promise<void>
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
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (canEdit && onUpload) setIsDragging(true)
    },
    [canEdit, onUpload]
  )

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
    },
    []
  )

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      if (!canEdit || !onUpload) return
      const file = e.dataTransfer.files?.[0]
      if (!file) return
      const validation = validateUploadFile(file)
      if (!validation.valid) {
        setUploadError(validation.error ?? 'Invalid file')
        return
      }
      setUploadError(null)
      setUploadProgress(20)
      try {
        const url = URL.createObjectURL(file)
        setUploadProgress(60)
        await onUpload({
          filename: file.name,
          url,
          type: file.type.startsWith('image/') ? 'itinerary' : 'other',
        })
        setUploadProgress(100)
      } catch {
        setUploadError('Upload failed')
      } finally {
        setTimeout(() => setUploadProgress(0), 500)
      }
    },
    [canEdit, onUpload]
  )

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file || !onUpload) return
      e.target.value = ''
      const validation = validateUploadFile(file)
      if (!validation.valid) {
        setUploadError(validation.error ?? 'Invalid file')
        return
      }
      setUploadError(null)
      setUploadProgress(20)
      try {
        const url = URL.createObjectURL(file)
        setUploadProgress(60)
        await onUpload({
          filename: file.name,
          url,
          type: file.type.startsWith('image/') ? 'itinerary' : 'other',
        })
        setUploadProgress(100)
      } catch {
        setUploadError('Upload failed')
      } finally {
        setTimeout(() => setUploadProgress(0), 500)
      }
    },
    [onUpload]
  )

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
            <>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,image/jpeg,image/jpg,image/png"
                className="sr-only"
                onChange={handleFileSelect}
                aria-label="Upload file"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="h-4 w-4" aria-hidden />
                Upload
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {uploadError && (
          <div
            className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
            role="alert"
          >
            {uploadError}
          </div>
        )}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mb-4">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Uploading...</p>
          </div>
        )}
        {canEdit && onUpload && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'mb-4 rounded-lg border-2 border-dashed p-6 text-center transition-colors',
              isDragging
                ? 'border-accent bg-accent/10'
                : 'border-border hover:border-accent/30'
            )}
          >
            <Upload className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden />
            <p className="mt-2 text-sm text-muted-foreground">
              Drag and drop files here, or click Upload
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              PDF, DOC, XLS, JPEG, PNG (max 10MB)
            </p>
          </div>
        )}
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
