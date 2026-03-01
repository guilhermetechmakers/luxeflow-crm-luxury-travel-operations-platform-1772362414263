/**
 * ChannelList - List of channels with search and create
 */
import { useState } from 'react'
import { Hash, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { Channel } from '@/types/chat'

export interface ChannelListProps {
  channels: Channel[]
  currentChannelId: string | null
  onSelectChannel: (channel: Channel) => void
  onCreateChannel: () => void
}

export function ChannelList({
  channels,
  currentChannelId,
  onSelectChannel,
  onCreateChannel,
}: ChannelListProps) {
  const [search, setSearch] = useState('')
  const channelList = (channels ?? []).filter((c) => !c.isDirect)
  const filtered = search.trim()
    ? channelList.filter((c) => (c.name ?? '').toLowerCase().includes(search.toLowerCase()))
    : channelList

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-2 border-b border-border">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            placeholder="Search channels"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9"
            aria-label="Search channels"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={onCreateChannel}
          aria-label="Create channel"
          className="shrink-0 h-9 w-9"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <p className="px-2 py-1.5 text-xs font-medium uppercase text-muted-foreground">Channels</p>
        <div className="space-y-0.5">
          {(filtered ?? []).map((ch) => {
            const isActive = ch.id === currentChannelId
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => onSelectChannel(ch)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-all duration-200',
                  'hover:bg-secondary hover:shadow-sm',
                  isActive
                    ? 'bg-accent/15 text-accent font-medium shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                aria-label={`Channel ${ch.name}`}
                aria-current={isActive ? 'true' : undefined}
              >
                <Hash className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate">{ch.name ?? 'Unnamed'}</span>
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
