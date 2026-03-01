/**
 * SearchPanel - Search messages, attachments, linked items
 */
import { useState, useCallback } from 'react'
import { Search, MessageSquare, FileText, Link2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatTimeAgo } from '@/lib/format'
import type { ChatMessage } from '@/types/chat'

export type SearchScope = 'messages' | 'attachments' | 'linked'

export interface SearchPanelProps {
  query: string
  onQueryChange: (q: string) => void
  onSearchExecute: (q: string, scope?: SearchScope) => void
  results?: ChatMessage[]
  isLoading?: boolean
}

export function SearchPanel({
  query,
  onQueryChange,
  onSearchExecute,
  results = [],
  isLoading,
}: SearchPanelProps) {
  const [scope, setScope] = useState<SearchScope>('messages')

  const handleSearch = useCallback(() => {
    onSearchExecute(query, scope)
  }, [query, scope, onSearchExecute])

  const resultList = Array.isArray(results) ? results : []

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border space-y-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            placeholder="Search messages..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-8"
            aria-label="Search messages"
          />
        </div>
        <div className="flex gap-1">
          {(['messages', 'attachments', 'linked'] as const).map((s) => (
            <Button
              key={s}
              variant={scope === s ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setScope(s)}
              className="flex-1"
            >
              {s === 'messages' && <MessageSquare className="h-3.5 w-3.5 mr-1" />}
              {s === 'attachments' && <FileText className="h-3.5 w-3.5 mr-1" />}
              {s === 'linked' && <Link2 className="h-3.5 w-3.5 mr-1" />}
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>
        <Button onClick={handleSearch} className="w-full" disabled={!query.trim() || isLoading}>
          Search
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
        ) : resultList.length > 0 ? (
          <div className="space-y-2">
            {resultList.map((msg) => (
              <div
                key={msg.id}
                className="rounded-lg border border-border bg-card p-3 text-sm hover:bg-secondary transition-colors"
              >
                <p className="line-clamp-2 text-foreground">{msg.content}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatTimeAgo(msg.createdAt)} · Channel {msg.channelId}
                </p>
              </div>
            ))}
          </div>
        ) : query.trim() ? (
          <div className="p-4 text-center text-sm text-muted-foreground">No results found</div>
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Enter a search term and select scope
          </div>
        )}
      </div>
    </div>
  )
}
