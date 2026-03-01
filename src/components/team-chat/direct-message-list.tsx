/**
 * DirectMessageList - List of DM conversations
 */
import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { Channel } from '@/types/chat'
import type { ChatUser } from '@/types/chat'

export interface DirectMessageListProps {
  channels: Channel[]
  users: ChatUser[]
  currentChannelId: string | null
  currentUserId?: string
  onSelectChannel: (channel: Channel) => void
}

function getInitials(name: string): string {
  return (name ?? '')
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function DirectMessageList({
  channels,
  users,
  currentChannelId,
  currentUserId = 'a1',
  onSelectChannel,
}: DirectMessageListProps) {
  const [search, setSearch] = useState('')
  const dmList = (channels ?? []).filter((c) => c.isDirect)
  const filtered = search.trim()
    ? dmList.filter((c) => (c.name ?? '').toLowerCase().includes(search.toLowerCase()))
    : dmList

  const getUserById = (id: string) => (users ?? []).find((u) => u.id === id)

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            placeholder="Search DMs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9"
            aria-label="Search direct messages"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <p className="px-2 py-1.5 text-xs font-medium uppercase text-muted-foreground">Direct Messages</p>
        <div className="space-y-0.5">
          {(filtered ?? []).map((ch) => {
            const isActive = ch.id === currentChannelId
            const otherMemberId = (ch.memberIds ?? []).find((id) => id !== currentUserId)
            const otherUser = otherMemberId ? getUserById(otherMemberId) : null
            const displayName = ch.name ?? otherUser?.name ?? 'Unknown'
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => onSelectChannel(ch)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-all duration-200',
                  'hover:bg-secondary hover:shadow-sm',
                  isActive
                    ? 'bg-accent/15 text-accent font-medium shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                aria-label={`Direct message with ${displayName}`}
                aria-current={isActive ? 'true' : undefined}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={otherUser?.avatarUrl ?? undefined} alt={displayName} />
                  <AvatarFallback className="text-xs">{getInitials(displayName)}</AvatarFallback>
                </Avatar>
                <span className="flex-1 truncate">{displayName}</span>
                {(ch.unreadCount ?? 0) > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent px-1.5 text-xs font-medium text-accent-foreground">
                    {ch.unreadCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
