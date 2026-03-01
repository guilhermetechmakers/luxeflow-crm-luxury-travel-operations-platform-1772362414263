/**
 * ChannelInfoPanel - Channel info, pinned messages, quick actions
 */
import { Hash, Pin, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatTimeAgo } from '@/lib/format'
import type { Channel } from '@/types/chat'
import type { ChatMessage, ChatUser } from '@/types/chat'

export interface ChannelInfoPanelProps {
  channel: Channel | null
  pinnedMessages: ChatMessage[]
  members: ChatUser[]
  onPinToggle?: (message: ChatMessage) => void
  onClearChat?: () => void
}

function getInitials(name: string): string {
  return (name ?? '')
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function ChannelInfoPanel({
  channel,
  pinnedMessages,
  members,
  onPinToggle,
  onClearChat,
}: ChannelInfoPanelProps) {
  if (!channel) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">Select a channel</p>
      </div>
    )
  }

  const pinnedList = (pinnedMessages ?? [])

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          {channel.isDirect ? (
            <Avatar className="h-10 w-10">
              <AvatarImage src={members[0]?.avatarUrl ?? undefined} alt={channel.name} />
              <AvatarFallback>{getInitials(channel.name ?? '')}</AvatarFallback>
            </Avatar>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15">
              <Hash className="h-5 w-5 text-accent" aria-hidden />
            </div>
          )}
          <div>
            <h3 className="font-serif font-semibold">{channel.name ?? 'Unnamed'}</h3>
            <p className="text-xs text-muted-foreground">
              {channel.isDirect ? 'Direct message' : `${(members ?? []).length} members`}
            </p>
          </div>
        </div>
      </div>

      {!channel.isDirect && members.length > 0 && (
        <div className="p-4 border-b border-border">
          <h4 className="text-xs font-medium uppercase text-muted-foreground mb-2">Members</h4>
          <div className="space-y-2">
            {(members ?? []).map((m) => (
              <div key={m.id} className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={m.avatarUrl ?? undefined} alt={m.name} />
                  <AvatarFallback className="text-[10px]">{getInitials(m.name ?? '')}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{m.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {pinnedList.length > 0 && (
        <div className="flex-1 overflow-y-auto p-4">
          <h4 className="text-xs font-medium uppercase text-muted-foreground mb-2">Pinned Messages</h4>
          <div className="space-y-2">
            {pinnedList.map((msg) => (
              <div
                key={msg.id}
                className="rounded-lg border border-border bg-secondary p-2 text-sm"
              >
                <p className="line-clamp-2">{msg.content}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{formatTimeAgo(msg.createdAt)}</span>
                  {onPinToggle && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onPinToggle(msg)}
                      aria-label="Unpin message"
                    >
                      <Pin className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pinnedList.length === 0 && (
        <div className="flex-1" />
      )}

      <div className="p-4 border-t border-border">
        {onClearChat && (
          <Button
            variant="outline"
            size="sm"
            className="w-full text-destructive hover:text-destructive"
            onClick={onClearChat}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear chat
          </Button>
        )}
      </div>
    </div>
  )
}
