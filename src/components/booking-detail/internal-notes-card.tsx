/**
 * InternalNotesCard - Private notes with search, tagging, handover templates
 */
import { useState } from 'react'
import { StickyNote, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { NoteDetail } from '@/types/booking'

export interface InternalNotesCardProps {
  notes: NoteDetail[]
  isLoading?: boolean
  onAddNote?: (content: string) => Promise<void>
  canEdit?: boolean
}

export function InternalNotesCard({
  notes = [],
  isLoading = false,
  onAddNote,
  canEdit = false,
}: InternalNotesCardProps) {
  const [content, setContent] = useState('')
  const [search, setSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const list = (notes ?? []).filter((n) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      (n.content ?? '').toLowerCase().includes(q) ||
      (n.author_name ?? '').toLowerCase().includes(q)
    )
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !onAddNote) return
    setSubmitting(true)
    try {
      await onAddNote(content.trim())
      setContent('')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Internal Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
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
        <CardTitle>Internal Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {canEdit && onAddNote && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="note-content">Add note</Label>
              <Textarea
                id="note-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Add an internal note..."
                className="mt-2"
                rows={3}
              />
            </div>
            <Button type="submit" disabled={!content.trim() || submitting}>
              {submitting ? 'Saving...' : 'Save Note'}
            </Button>
          </form>
        )}

        <div>
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                type="search"
                placeholder="Search notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                aria-label="Search notes"
              />
            </div>
          </div>

          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
              <StickyNote
                className="h-12 w-12 text-muted-foreground"
                aria-hidden
              />
              <p className="mt-4 text-muted-foreground">
                {search.trim() ? 'No matching notes' : 'No notes yet'}
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {(list ?? []).map((note) => (
                <li
                  key={note.id}
                  className={cn(
                    'rounded-lg border border-border p-4 transition-all duration-200',
                    'hover:border-accent/30'
                  )}
                >
                  <p className="text-sm">{note.content ?? ''}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {note.author_name ?? 'Unknown'} ·{' '}
                      {formatDate(note.created_at)}
                    </span>
                    {(note.tags ?? []).length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        · {(note.tags ?? []).join(', ')}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
