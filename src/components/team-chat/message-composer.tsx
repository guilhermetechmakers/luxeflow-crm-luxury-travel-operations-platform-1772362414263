/**
 * MessageComposer - Text input, attachments, mention autocomplete, link-to-booking/client
 */
import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { ChatUser } from '@/types/chat'

const MAX_CONTENT_LENGTH = 4000

export interface MessageComposerProps {
  onSend: (content: string, opts?: { linkedBookingId?: string; linkedClientId?: string; mentions?: string[] }) => void
  onAttach?: () => void
  onMentionQuery?: (query: string) => ChatUser[] | Promise<ChatUser[]>
  onLinkToBookingClient?: () => void
  linkContext?: { bookingId?: string; clientId?: string }
  onClearLink?: () => void
  channelId: string | null
  disabled?: boolean
  isSending?: boolean
}

export function MessageComposer({
  onSend,
  onAttach,
  onMentionQuery,
  onLinkToBookingClient,
  linkContext: linkContextProp,
  onClearLink,
  channelId,
  disabled,
  isSending,
}: MessageComposerProps) {
  const [content, setContent] = useState('')
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionUsers, setMentionUsers] = useState<ChatUser[]>([])
  const [showMentions, setShowMentions] = useState(false)
  const [mentionIndex, setMentionIndex] = useState(0)
  const linkContext = linkContextProp ?? {}
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!mentionQuery || !onMentionQuery) {
      setMentionUsers([])
      setShowMentions(false)
      return
    }
    const run = async () => {
      const result = onMentionQuery(mentionQuery)
      const users = Array.isArray(result) ? result : await result
      setMentionUsers(users ?? [])
      setShowMentions((users ?? []).length > 0)
      setMentionIndex(0)
    }
    run()
  }, [mentionQuery, onMentionQuery])

  useEffect(() => {
    const cursor = content.lastIndexOf('@')
    if (cursor >= 0) {
      const after = content.slice(cursor + 1)
      const space = after.indexOf(' ')
      const query = space >= 0 ? after.slice(0, space) : after
      setMentionQuery(query)
    } else {
      setMentionQuery('')
    }
  }, [content])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMentions && mentionUsers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setMentionIndex((i) => Math.min(i + 1, mentionUsers.length - 1))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setMentionIndex((i) => Math.max(i - 1, 0))
        return
      }
      if (e.key === 'Enter' && mentionUsers[mentionIndex]) {
        e.preventDefault()
        const user = mentionUsers[mentionIndex]!
        const cursor = content.lastIndexOf('@')
        const before = content.slice(0, cursor)
        const after = content.slice(cursor).replace(/@\w*(\s|$)/, `@${user.name} `)
        setContent(before + after)
        setShowMentions(false)
        return
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = () => {
    const trimmed = (content ?? '').trim()
    if (!trimmed || disabled || isSending) return
    const mentionNames = (trimmed.match(/@([\w\s]+)/g) ?? []).map((m) => m.slice(1).trim()).filter(Boolean)
    const mentionIds = mentionNames
      .map((name) => (mentionUsers ?? []).find((u) => (u.name ?? '').toLowerCase().includes(name.toLowerCase()))?.id)
      .filter((id): id is string => !!id)
    onSend(trimmed, {
      linkedBookingId: linkContext.bookingId,
      linkedClientId: linkContext.clientId,
      mentions: mentionIds.length > 0 ? mentionIds : undefined,
    })
    setContent('')
    onClearLink?.()
  }

  const canSend = content.trim().length > 0 && content.length <= MAX_CONTENT_LENGTH

  if (!channelId) {
    return (
      <div className="flex h-20 shrink-0 items-center justify-center border-t border-border bg-muted/30">
        <p className="text-sm text-muted-foreground">Select a channel to send messages</p>
      </div>
    )
  }

  return (
    <div className="relative shrink-0 border-t border-border bg-card p-4">
      <div className="flex items-end gap-2">
        <div className="flex flex-1 flex-col gap-2">
          {(linkContext.bookingId || linkContext.clientId) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {linkContext.bookingId && <span>Linked: Booking {linkContext.bookingId}</span>}
              {linkContext.clientId && <span>Linked: Client {linkContext.clientId}</span>}
            </div>
          )}
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, MAX_CONTENT_LENGTH))}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... Use @ for mentions, link to booking/client"
              className="min-h-[44px] max-h-32 resize-none pr-12"
              disabled={disabled}
              rows={1}
              aria-label="Message input"
            />
            {showMentions && mentionUsers.length > 0 && (
              <div className="absolute bottom-full left-0 mb-1 w-64 rounded-lg border border-border bg-card shadow-card animate-fade-in overflow-hidden z-10">
                {(mentionUsers ?? []).map((u, i) => (
                  <button
                    key={u.id}
                    type="button"
                    className={cn(
                      'flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-secondary',
                      i === mentionIndex && 'bg-accent/15'
                    )}
                    onClick={() => {
                      const cursor = content.lastIndexOf('@')
                      const before = content.slice(0, cursor)
                      const after = content.slice(cursor).replace(/@\w*(\s|$)/, `@${u.name} `)
                      setContent(before + after)
                      setShowMentions(false)
                    }}
                  >
                    {u.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onAttach}
              aria-label="Attach file"
              className="h-8 w-8"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            {onLinkToBookingClient && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Link to booking or client" className="h-8 w-8">
                    <Link2 className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-64">
                  <p className="text-sm font-medium mb-2">Link context</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    Use the search panel to find and link a booking or client to this message.
                  </p>
                  <Button variant="outline" size="sm" onClick={onLinkToBookingClient}>
                    Open Link Picker
                  </Button>
                  {onClearLink && (linkContext.bookingId || linkContext.clientId) && (
                    <Button variant="ghost" size="sm" onClick={onClearLink} className="ml-2">
                      Clear
                    </Button>
                  )}
                </PopoverContent>
              </Popover>
            )}
            <span className="text-xs text-muted-foreground ml-auto">
              {content.length}/{MAX_CONTENT_LENGTH}
            </span>
          </div>
        </div>
        <Button
          onClick={handleSend}
          disabled={!canSend || disabled || isSending}
          size="icon"
          className="h-10 w-10 shrink-0"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
