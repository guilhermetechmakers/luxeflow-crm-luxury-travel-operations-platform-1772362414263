/**
 * ChannelHeader - Channel name, member avatars, actions
 */
import { Hash, Info, Pin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Channel } from '@/types/chat'
import type { ChatUser } from '@/types/chat'

export interface ChannelHeaderProps {
  channel: Channel | null
  members: ChatUser[]
  pinnedCount: number
  onOpenInfo: () => void
}

function getInitials(name: string): string {
  return (name ?? '')
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function ChannelHeader({ channel, members, pinnedCount, onOpenInfo }: ChannelHeaderProps) {
  if (!channel) {
    return (
      <div className="flex h-14 shrink-0 items-center border-b border-border px-4">
        <p className="text-sm text-muted-foreground">Select a channel</p>
      </div>
    )
  }

  const displayName = channel.name ?? 'Unnamed'
  const memberList = (members ?? []).slice(0, 5)

  return (
    <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
      <div className="flex items-center gap-3 min-w-0">
        {channel.isDirect ? (
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={members[0]?.avatarUrl ?? undefined} alt={displayName} />
            <AvatarFallback className="text-xs">{getInitials(displayName)}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15">
            <Hash className="h-4 w-4 text-accent" aria-hidden />
          </div>
        )}
        <div className="min-w-0">
          <h2 className="font-serif text-lg font-semibold truncate">{displayName}</h2>
          {!channel.isDirect && memberList.length > 0 && (
            <div className="flex -space-x-2">
              {memberList.map((m) => (
                <Avatar key={m.id} className="h-5 w-5 border-2 border-card">
                  <AvatarImage src={m.avatarUrl ?? undefined} alt={m.name} />
                  <AvatarFallback className="text-[10px]">{getInitials(m.name ?? '')}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {pinnedCount > 0 && (
          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`${pinnedCount} pinned messages`}>
            <Pin className="h-4 w-4" />
            <span className="ml-1 text-xs">{pinnedCount}</span>
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenInfo}
          aria-label="Channel info"
          className="h-8 w-8"
        >
          <Info className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
