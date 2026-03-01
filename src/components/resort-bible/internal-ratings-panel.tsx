/**
 * InternalRatingsPanel - Internal rating/panel notes, add notes for authorized users
 */
import { useState, useCallback } from 'react'
import { Star, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import type { Rating } from '@/types/resort-bible'
import { cn } from '@/lib/utils'

export interface InternalRatingsPanelProps {
  ratings?: Rating[] | null
  resortId?: string
  resortName?: string
  canAddNotes?: boolean
  onAddNote?: (resortId: string, rating: number, notes: string) => Promise<void>
  className?: string
}

function getAverageRating(ratings: Rating[]): number | null {
  if (ratings.length === 0) return null
  const sum = ratings.reduce((a, r) => a + (r?.rating ?? 0), 0)
  return Math.round((sum / ratings.length) * 10) / 10
}

export function InternalRatingsPanel({
  ratings,
  resortId,
  resortName = '',
  canAddNotes = false,
  onAddNote,
  className,
}: InternalRatingsPanelProps) {
  const list = ensureArray(ratings)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [newRating, setNewRating] = useState(5)
  const [newNotes, setNewNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const avgRating = getAverageRating(list)

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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 fill-supporting text-supporting" />
          Internal ratings
        </CardTitle>
        {canAddNotes && onAddNote && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAddModalOpen(true)}
            aria-label={`Add rating for ${resortName}`}
          >
            <Plus className="h-4 w-4" />
            Add note
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No internal ratings yet.
            {canAddNotes && onAddNote && (
              <>
                {' '}
                <Button
                  variant="link"
                  className="h-auto p-0 pl-1 text-accent"
                  onClick={() => setAddModalOpen(true)}
                >
                  Add first rating
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {avgRating != null && (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-semibold">{avgRating}</span>
                <span className="text-muted-foreground">/ 5</span>
                <span className="text-sm text-muted-foreground">
                  ({list.length} rating{list.length !== 1 ? 's' : ''})
                </span>
              </div>
            )}
            <ul className="space-y-2" role="list">
              {list.map((r) => (
                <li
                  key={r.id}
                  className="border-b border-border pb-2 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{r.rating}/5</span>
                    {r.reviewer && (
                      <span className="text-sm text-muted-foreground">— {r.reviewer}</span>
                    )}
                  </div>
                  {r.notes && (
                    <p className="mt-1 text-sm text-muted-foreground">{r.notes}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>

      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add internal rating</DialogTitle>
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
