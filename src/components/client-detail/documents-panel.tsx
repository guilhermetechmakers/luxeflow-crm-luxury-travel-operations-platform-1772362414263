/**
 * DocumentsPanel - Upload passport/visa, OCR status, previews, expiry alerts
 */
import { useState, useRef } from 'react'
import { FileText, Upload, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatDate } from '@/lib/format'
import { validateUploadFile } from '@/lib/validation'
import { toast } from 'sonner'
import type { Document, DocumentType } from '@/types/client-detail'

const EXPIRY_WARN_DAYS = 180

function isExpiringSoon(expiryDate: string | undefined): boolean {
  if (!expiryDate) return false
  const exp = new Date(expiryDate).getTime()
  const now = Date.now()
  const daysLeft = (exp - now) / (1000 * 60 * 60 * 24)
  return daysLeft > 0 && daysLeft <= EXPIRY_WARN_DAYS
}

export interface DocumentsPanelProps {
  documents: Document[]
  isLoading?: boolean
  onUpload?: (type: DocumentType, file: File) => Promise<void>
}

export function DocumentsPanel({
  documents,
  isLoading = false,
  onUpload,
}: DocumentsPanelProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadType, setUploadType] = useState<DocumentType>('passport')
  const inputRef = useRef<HTMLInputElement>(null)
  const list = documents ?? []

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !onUpload) return
    const validation = validateUploadFile(file)
    if (!validation.valid) {
      toast.error(validation.error)
      e.target.value = ''
      return
    }
    setUploading(true)
    try {
      await onUpload(uploadType, file)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-lg bg-secondary/50"
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Documents</CardTitle>
        {onUpload && (
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={uploadType}
              onValueChange={(v) => setUploadType(v as DocumentType)}
            >
              <SelectTrigger className="w-32" aria-label="Document type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="passport">Passport</SelectItem>
                <SelectItem value="visa">Visa</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="sr-only"
              onChange={handleFileSelect}
              disabled={uploading}
              aria-label="Upload document"
            />
            <Button
              variant="outline"
              size="sm"
              type="button"
              disabled={uploading}
              className="gap-2"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No documents uploaded</p>
            <p className="text-sm text-muted-foreground">
              Upload passport or visa for OCR extraction
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((doc) => {
              const expiring = isExpiringSoon(doc.expiryDate)
              return (
                <div
                  key={doc.id}
                  className="flex flex-col gap-2 rounded-lg border border-border p-4 transition-colors hover:bg-secondary/30 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-secondary p-2">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium capitalize">{doc.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {doc.issuingCountry ?? '—'} • Uploaded{' '}
                        {formatDate(doc.uploadedAt)}
                      </p>
                      {doc.expiryDate && (
                        <p
                          className={`mt-1 text-sm ${
                            expiring ? 'text-amber-600' : 'text-muted-foreground'
                          }`}
                        >
                          {expiring && (
                            <AlertTriangle className="mr-1 inline h-4 w-4" />
                          )}
                          Expires {formatDate(doc.expiryDate)}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
