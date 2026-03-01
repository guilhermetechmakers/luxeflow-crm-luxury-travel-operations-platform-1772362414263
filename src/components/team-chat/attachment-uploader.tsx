/**
 * AttachmentUploader - File validation, progress, preview thumbnails
 */
import { useCallback, useState } from 'react'
import { FileText, Image } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChatAttachment } from '@/types/chat'

const MAX_SIZE_MB = 10
const MAX_SIZE = MAX_SIZE_MB * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

export interface AttachmentUploaderProps {
  onUpload: (files: { filename: string; url: string; mimeType: string; size: number }[]) => void
  existingAttachments?: ChatAttachment[]
  disabled?: boolean
}

export function AttachmentUploader({
  onUpload,
  existingAttachments = [],
  disabled,
}: AttachmentUploaderProps) {
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_SIZE) {
      return `File ${file.name} exceeds ${MAX_SIZE_MB}MB limit`
    }
    if (ALLOWED_TYPES.length > 0 && !ALLOWED_TYPES.includes(file.type)) {
      return `File type ${file.type} not allowed. Use image, PDF, or DOCX.`
    }
    return null
  }

  const processFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return
      setError(null)
      const valid: { filename: string; url: string; mimeType: string; size: number }[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (!file) continue
        const err = validateFile(file)
        if (err) {
          setError(err)
          return
        }
        valid.push({
          filename: file.name,
          url: URL.createObjectURL(file),
          mimeType: file.type,
          size: file.size,
        })
      }
      if (valid.length > 0) onUpload(valid)
    },
    [onUpload]
  )

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (disabled) return
    processFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => setDragOver(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files)
    e.target.value = ''
  }

  const existing = (existingAttachments ?? [])

  return (
    <div className="space-y-2">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'rounded-lg border-2 border-dashed p-4 text-center transition-colors',
          dragOver ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50',
          disabled && 'opacity-50 pointer-events-none'
        )}
      >
        <input
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleInputChange}
          className="hidden"
          id="chat-attachment-input"
          disabled={disabled}
        />
        <label htmlFor="chat-attachment-input" className="cursor-pointer">
          <p className="text-sm text-muted-foreground">
            Drag files here or <span className="text-accent font-medium">browse</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Images, PDF, DOCX up to {MAX_SIZE_MB}MB</p>
        </label>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {existing.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {existing.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-2 py-1.5"
            >
              {att.mimeType?.startsWith('image/') ? (
                <Image className="h-4 w-4 text-muted-foreground" />
              ) : (
                <FileText className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm truncate max-w-[120px]">{att.filename}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
