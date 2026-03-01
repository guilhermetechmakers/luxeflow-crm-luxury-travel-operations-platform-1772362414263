/**
 * MediaGalleryInlineEditor - Add/remove media items and captions within Resort Detail
 * Upload integration stub - validates non-empty URLs when adding, confirm on delete
 */
import { useState, useCallback } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { ensureArray } from '@/lib/resort-bible-utils'
import type { MediaItem } from '@/types/resort-bible'
import { cn } from '@/lib/utils'

export interface MediaGalleryInlineEditorProps {
  items?: MediaItem[] | null
  onItemsChange?: (items: MediaItem[]) => void
  canEdit?: boolean
  resortName?: string
  className?: string
}

export function MediaGalleryInlineEditor({
  items,
  onItemsChange,
  canEdit = false,
  resortName = '',
  className,
}: MediaGalleryInlineEditorProps) {
  const media = ensureArray(items)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [newUrl, setNewUrl] = useState('')
  const [newCaption, setNewCaption] = useState('')
  const [newType, setNewType] = useState<'image' | 'video'>('image')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const handleAdd = useCallback(() => {
    const url = (newUrl ?? '').trim()
    if (!url) return
    const newItem: MediaItem = {
      id: `m-${Date.now()}`,
      resortId: '',
      url,
      caption: (newCaption ?? '').trim() || undefined,
      type: newType,
    }
    onItemsChange?.([...media, newItem])
    setNewUrl('')
    setNewCaption('')
    setNewType('image')
    setAddModalOpen(false)
  }, [media, newUrl, newCaption, newType, onItemsChange])

  const handleDelete = useCallback(
    (id: string) => {
      if (!onItemsChange) return
      const next = media.filter((m) => m.id !== id)
      onItemsChange(next)
      setDeleteConfirmId(null)
    },
    [media, onItemsChange]
  )

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {media.map((m) => (
          <div
            key={m.id}
            className="group relative aspect-video overflow-hidden rounded-lg border border-border bg-secondary transition-shadow hover:shadow-card"
          >
            {m.type === 'video' ? (
              <video
                src={m.url}
                className="h-full w-full object-cover"
                controls
                muted
                playsInline
              />
            ) : (
              <img
                src={m.url}
                alt={m.caption ?? 'Resort media'}
                className="h-full w-full object-cover"
              />
            )}
            {m.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <p className="text-left text-xs text-white line-clamp-2">
                  {m.caption}
                </p>
              </div>
            )}
            {canEdit && onItemsChange && (
              <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                {deleteConfirmId === m.id ? (
                  <div className="flex gap-1 rounded bg-background/90 p-1">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 text-xs"
                      onClick={() => handleDelete(m.id)}
                      aria-label="Confirm delete"
                    >
                      Delete
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => setDeleteConfirmId(null)}
                      aria-label="Cancel"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8"
                    onClick={() => setDeleteConfirmId(m.id)}
                    aria-label={`Remove ${m.caption ?? 'media'}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
        {canEdit && onItemsChange && (
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="flex aspect-video items-center justify-center rounded-lg border-2 border-dashed border-border transition-colors hover:border-accent hover:bg-accent/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Add media"
          >
            <Plus className="h-8 w-8 text-muted-foreground" />
          </button>
        )}
      </div>

      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add media</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="media-url">URL *</Label>
              <Input
                id="media-url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://..."
                className="mt-1"
                aria-required
              />
            </div>
            <div>
              <Label htmlFor="media-caption">Caption</Label>
              <Input
                id="media-caption"
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                placeholder="Optional caption"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Type</Label>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewType('image')}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-sm transition-colors',
                    newType === 'image'
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border hover:bg-secondary'
                  )}
                  aria-pressed={newType === 'image'}
                >
                  Image
                </button>
                <button
                  type="button"
                  onClick={() => setNewType('video')}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-sm transition-colors',
                    newType === 'video'
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border hover:bg-secondary'
                  )}
                  aria-pressed={newType === 'video'}
                >
                  Video
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!(newUrl ?? '').trim()}
              aria-label={`Add ${newType} to ${resortName} gallery`}
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
