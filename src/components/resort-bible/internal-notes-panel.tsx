/**
 * InternalNotesPanel - Panel notes, ratings, reviewer, date, category, search
 * Combines internalRatings and panelNotes with search and audit trail display
 */
import { useState, useMemo, useCallback } from 'react'
import { Star, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { ensureArray } from '@/lib/resort-bible-utils'
import type { Rating, Note } from '@/types/resort-bible'
import { cn } from '@/lib/utils'

export interface InternalNotesPanelProps {
  ratings?: Rating[] | null
  panelNotes?: Note[] | null
  resortId?: string
  resortName?: string
  canAddNotes?: boolean
  onAddNote?: (resortId: string, rating: number, notes: string) => Promise<void>
  className?: string
}

type NoteItem = {
  id: string
  author: string
  text: string
  date: string
  category?: string
  rating?: number
  type: 'rating' | 'note'
}

function toNoteItems(ratings: Rating[], notes: Note[]): NoteItem[] {
  const fromRatings: NoteItem[] = (ratings ?? []).map((r) => ({
    id: r.id,
    author: r.reviewer ?? 'Unknown',
    text: r.notes ?? r.comments ?? '',
    date: r.date ?? '',
    category: r.source,
    rating: r.rating,
    type: 'rating' as const,
  }))
  const fromNotes: NoteItem[] = (notes ?? []).map((n) => ({
    id: n.id,
    author: n.author,
    text: n.text,
    date: n.date,
    category: n.category,
    rating: n.rating,
    type: 'note' as const,
  }))
  return [...fromRatings, ...fromNotes].sort((a, b) => {
    const dA = a.date ? new Date(a.date).getTime() : 0
    const dB = b.date ? new Date(b.date).getTime() : 0
    return dB - dA
  })
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export function InternalNotesPanel({
  ratings,
  panelNotes,
  resortId,
  resortName = '',
  canAddNotes = false,
  onAddNote,
  className,
}: InternalNotesPanelProps) {
  const ratingsList = ensureArray(ratings)
  const notesList = ensureArray(panelNotes)
  const allItems = useMemo(
    () => toNoteItems(ratingsList, notesList),
    [ratingsList, notesList]
  )

  const [searchQuery, setSearchQuery] = useState('')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [newRating, setNewRating] = useState(5)
  const [newNotes, setNewNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredItems = useMemo(() => {
    const q = (searchQuery ?? '').toLowerCase().trim()
    if (!q) return allItems
    return allItems.filter(
      (item) =>
        item.text.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q) ||
        (item.category ?? '').toLowerCase().includes(q)
    )
  }, [allItems, searchQuery])

  const avgRating = useMemo(() => {
    const withRating = ratingsList.filter((r) => r?.rating != null)
    if (withRating.length === 0) return null
    const sum = withRating.reduce((a, r) => a + (r?.rating ?? 0), 0)
    return Math.round((sum / withRating.length) * 10) / 10
  }, [ratingsList])

  const handleAddNote = useCallback(async () => {
    if (!onAddNote || !resortId) return
    setIsSubmitting(true)
    try {
      await onAddNote(resortId, newRating, newNotes)
      setAddModalOpen(false)
      setNewRating(5)
      setNewNotes('')
    } finally {
      setIsSubmitting(false)
    }
  }, [onAddNote, resortId, newRating, newNotes])

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 fill-supporting text-supporting" />
          Internal notes
        </CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          {allItems.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 pl-9"
                aria-label="Search internal notes"
              />
            </div>
          )}
          {canAddNotes && onAddNote && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddModalOpen(true)}
              aria-label={`Add note for ${resortName}`}
            >
              <Plus className="h-4 w-4" />
              Add note
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {allItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
            <p className="text-sm text-muted-foreground">No internal notes yet.</p>
            {canAddNotes && onAddNote && (
              <Button
                variant="link"
                className="mt-2 text-accent"
                onClick={() => setAddModalOpen(true)}
              >
                Add first note
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {avgRating != null && (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-semibold">{avgRating}</span>
                <span className="text-muted-foreground">/ 5</span>
                <span className="text-sm text-muted-foreground">
                  ({ratingsList.length} rating{ratingsList.length !== 1 ? 's' : ''})
                </span>
              </div>
            )}
            {filteredItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notes match your search.</p>
            ) : (
              <ul className="space-y-4" role="list">
                {filteredItems.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-lg border border-border p-4 transition-shadow hover:shadow-card"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {item.rating != null && (
                          <span className="flex items-center gap-1 font-medium">
                            <Star className="h-4 w-4 fill-supporting text-supporting" />
                            {item.rating}/5
                          </span>
                        )}
                        <span className="text-sm text-muted-foreground">— {item.author}</span>
                        {item.date && (
                          <span className="text-xs text-muted-foreground">
                            {formatDate(item.date)}
                          </span>
                        )}
                      </div>
                      {item.category && (
                        <span className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                          {item.category}
                        </span>
                      )}
                    </div>
                    {item.text && (
                      <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>

      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add internal note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Rating (1–5)</Label>
              <div className="mt-2 flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNewRating(n)}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg border transition-colors',
                      newRating === n
                        ? 'border-accent bg-accent text-accent-foreground'
                        : 'border-border hover:bg-secondary'
                    )}
                    aria-label={`Rate ${n} stars`}
                    aria-pressed={newRating === n}
                  >
                    <Star
                      className={cn(
                        'h-5 w-5',
                        newRating >= n ? 'fill-supporting text-supporting' : ''
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Internal notes..."
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNote} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
