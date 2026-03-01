/**
 * CommunicationsPanel - Timeline of emails, calls, messages; search/filter
 */
import { useState } from 'react'
import { Mail, Phone, MessageCircle, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/format'
import type { Communication, CommunicationType } from '@/types/client-detail'

function getIcon(type: CommunicationType) {
  switch (type) {
    case 'email':
      return <Mail className="h-4 w-4 text-muted-foreground" />
    case 'call':
      return <Phone className="h-4 w-4 text-muted-foreground" />
    case 'message':
      return <MessageCircle className="h-4 w-4 text-muted-foreground" />
    default:
      return <Mail className="h-4 w-4 text-muted-foreground" />
  }
}

export interface CommunicationsPanelProps {
  communications: Communication[]
  isLoading?: boolean
}

export function CommunicationsPanel({
  communications,
  isLoading = false,
}: CommunicationsPanelProps) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<CommunicationType | 'all'>('all')

  const list = (communications ?? []).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  const filtered = list.filter((c) => {
    const matchSearch =
      !search ||
      c.content.toLowerCase().includes(search.toLowerCase()) ||
      (c.senderName ?? '').toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'all' || c.type === typeFilter
    return matchSearch && matchType
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Communication Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
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
        <CardTitle>Communication Log</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search communications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              aria-label="Search communications"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(e.target.value as CommunicationType | 'all')
            }
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
            aria-label="Filter by type"
          >
            <option value="all">All types</option>
            <option value="email">Email</option>
            <option value="call">Call</option>
            <option value="message">Message</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No communications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="flex gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-secondary/30"
              >
                <div className="shrink-0 rounded-lg bg-secondary p-2">
                  {getIcon(c.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium capitalize">{c.type}</p>
                  <p className="mt-1 text-sm">{c.content}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {c.senderName ?? 'Unknown'} • {formatDate(c.timestamp)}
                    {Array.isArray(c.recipients) && c.recipients.length > 0 && (
                      <> • To: {(c.recipients ?? []).join(', ')}</>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
