/**
 * MessageList - Chat messages with mentions, attachments, context links
 */
import { useRef, useEffect } from 'react'
import { FileText, Link2, MoreHorizontal, Pin, CheckSquare, Copy, StickyNote } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { formatTimeAgo } from '@/lib/format'
import type { ChatMessage, ChatUser } from '@/types/chat'

export interface MessageListProps {
  messages: ChatMessage[]
  currentUser: ChatUser | null
  users: ChatUser[]
  onReact?: (messageId: string, emoji: string) => void
  onMentionClick?: (userId: string) => void
  onLinkClick?: (type: 'booking' | 'client', id: string) => void
  onCreateTask?: (message: ChatMessage) => void
  onCopyLink?: (message: ChatMessage) => void
  onConvertToNote?: (message: ChatMessage) => void
  onPinToggle?: (message: ChatMessage) => void
}

function getInitials(name: string): string {
  return (name ?? '')
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function renderContent(content: string, users: ChatUser[], onMentionClick?: (userId: string) => void) {
  if (!content) return null
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  const mentionRegex = /@(\w+(?:\s+\w+)?)/g
  let match: RegExpExecArray | null
  while ((match = mentionRegex.exec(content)) !== null) {
    const fullMatch = match[0]
    const namePart = match[1]
    const user = (users ?? []).find((u) => (u.name ?? '').toLowerCase().includes((namePart ?? '').toLowerCase()))
    if (lastIndex < match.index) {
      parts.push(content.slice(lastIndex, match.index))
    }
    parts.push(
      <span
        key={match.index}
        className="rounded bg-accent/20 px-1 font-medium text-accent cursor-pointer hover:bg-accent/30"
        onClick={() => user && onMentionClick?.(user.id)}
        role={user ? 'button' : undefined}
      >
        {fullMatch}
      </span>
    )
    lastIndex = match.index + fullMatch.length
  }
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex))
  }
  return parts.length > 0 ? parts : content
}

export function MessageList({
  messages,
  currentUser,
  users,
  onMentionClick,
  onLinkClick,
  onCreateTask,
  onCopyLink,
  onConvertToNote,
  onPinToggle,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const msgList = (messages ?? [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [msgList.length])

  const getUserById = (id: string) => (users ?? []).find((u) => u.id === id)

  if (msgList.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <p className="text-sm text-muted-foreground">No messages yet. Start the conversation.</p>
      </div>
    )
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
      {(msgList ?? []).map((msg, idx) => {
        const sender = getUserById(msg.senderId)
        const senderName = sender?.name ?? 'Unknown'
        const isCurrentUser = currentUser?.id === msg.senderId
        const prevMsg = msgList[idx - 1]
        const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId

        return (
          <div
            key={msg.id}
            className={cn(
              'group flex gap-3 animate-fade-in',
              isCurrentUser && 'flex-row-reverse'
            )}
          >
            <div className={cn('shrink-0', !showAvatar && 'invisible')}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={sender?.avatarUrl ?? undefined} alt={senderName} />
                <AvatarFallback className="text-xs">{getInitials(senderName)}</AvatarFallback>
              </Avatar>
            </div>
            <div className={cn('flex min-w-0 flex-1 flex-col', isCurrentUser && 'items-end')}>
              {showAvatar && (
                <div className={cn('flex items-center gap-2 mb-0.5', isCurrentUser && 'flex-row-reverse')}>
                  <span className="text-sm font-medium text-foreground">{senderName}</span>
                  <span className="text-xs text-muted-foreground">{formatTimeAgo(msg.createdAt)}</span>
                </div>
              )}
              <div
                className={cn(
                  'rounded-lg px-3 py-2 max-w-[85%]',
                  isCurrentUser ? 'bg-accent/15 text-accent-foreground' : 'bg-secondary'
                )}
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {renderContent(msg.content ?? '', users ?? [], onMentionClick)}
                </p>
                {(msg.attachments ?? []).length > 0 && (
                  <div className="mt-2 space-y-1">
                    {(msg.attachments ?? []).map((att) => (
                      <a
                        key={att.id}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded border border-border bg-card px-2 py-1.5 text-sm hover:bg-secondary transition-colors"
                      >
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="truncate">{att.filename}</span>
                      </a>
                    ))}
                  </div>
                )}
                {(msg.linkedBookingId || msg.linkedClientId) && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {msg.linkedBookingId && (
                      <button
                        type="button"
                        onClick={() => onLinkClick?.('booking', msg.linkedBookingId!)}
                        className="inline-flex items-center gap-1.5 rounded border border-accent/30 bg-accent/10 px-2 py-1 text-xs font-medium text-accent hover:bg-accent/20 transition-colors"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        Booking {msg.linkedBookingId}
                      </button>
                    )}
                    {msg.linkedClientId && (
                      <button
                        type="button"
                        onClick={() => onLinkClick?.('client', msg.linkedClientId!)}
                        className="inline-flex items-center gap-1.5 rounded border border-accent/30 bg-accent/10 px-2 py-1 text-xs font-medium text-accent hover:bg-accent/20 transition-colors"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        Client {msg.linkedClientId}
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className={cn('flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity', isCurrentUser && 'flex-row-reverse')}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Message actions">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isCurrentUser ? 'end' : 'start'}>
                    <DropdownMenuItem onClick={() => onCreateTask?.(msg)}>
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Create Task
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onCopyLink?.(msg)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onConvertToNote?.(msg)}>
                      <StickyNote className="h-4 w-4 mr-2" />
                      Convert to Note
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onPinToggle?.(msg)}>
                      <Pin className="h-4 w-4 mr-2" />
                      {msg.pinned ? 'Unpin' : 'Pin'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
