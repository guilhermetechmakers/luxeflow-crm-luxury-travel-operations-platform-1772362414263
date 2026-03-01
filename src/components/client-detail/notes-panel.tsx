/**
 * NotesPanel - Create/edit notes with visibility (private/team/org), sort by date
 * Supports @mentions with highlighting via MentionsEngine
 */
import { useState } from 'react'
import { StickyNote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatDate } from '@/lib/format'
import { parseMentions, extractMentions } from '@/lib/mentions'
import type { Note, NoteVisibility } from '@/types/client-detail'

function NoteContent({ content }: { content: string }) {
  const segments = parseMentions(content)
  if (segments.length === 0) {
    return <p className="text-sm">{content}</p>
  }
  return (
    <p className="text-sm">
      {segments.map((seg, i) =>
        seg.type === 'mention' ? (
          <span
            key={i}
            className="rounded bg-primary/15 px-1 py-0.5 font-medium text-primary"
          >
            @{seg.value}
          </span>
        ) : (
          <span key={i}>{seg.value}</span>
        )
      )}
    </p>
  )
}

export interface NotesPanelProps {
  notes: Note[]
  isLoading?: boolean
  onCreateNote?: (
    content: string,
    visibility: NoteVisibility,
    mentions?: string[]
  ) => Promise<void>
  canEdit?: boolean
}

export function NotesPanel({
  notes,
  isLoading = false,
  onCreateNote,
  canEdit = true,
}: NotesPanelProps) {
  const [content, setContent] = useState('')
  const [visibility, setVisibility] = useState<NoteVisibility>('team')
  const [submitting, setSubmitting] = useState(false)

  const list = (notes ?? []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !onCreateNote) return
    setSubmitting(true)
    try {
      const trimmed = content.trim()
      const mentions = extractMentions(trimmed)
      await onCreateNote(trimmed, visibility, mentions.length > 0 ? mentions : undefined)
      setContent('')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-lg bg-secondary/50"
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
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {canEdit && onCreateNote && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="note-content">Add note</Label>
              <Textarea
                id="note-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Add a note... Use @name to mention team members"
                className="mt-2"
                rows={3}
              />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="note-visibility">Visibility</Label>
                <Select
                  value={visibility}
                  onValueChange={(v) => setVisibility(v as NoteVisibility)}
                >
                  <SelectTrigger id="note-visibility" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="org">Organization</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={!content.trim() || submitting}>
                {submitting ? 'Saving...' : 'Save Note'}
              </Button>
            </div>
          </form>
        )}

        <div>
          <h4 className="text-sm font-medium text-muted-foreground">
            Recent Notes
          </h4>
          {list.length === 0 ? (
            <div className="mt-4 flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-8 text-center">
              <StickyNote className="h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">No notes yet</p>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {list.map((note) => (
                <li
                  key={note.id}
                  className="rounded-lg border border-border p-4"
                >
                  <NoteContent content={note.content} />
                  <p className="mt-2 text-xs text-muted-foreground">
                    {note.authorName ?? 'Unknown'} • {formatDate(note.createdAt)}{' '}
                    • {note.visibility}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
