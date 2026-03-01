/**
 * ClientSelector - Search existing clients, select, or create new
 * Auto-fills passport, billing, VIP flags when existing client selected
 */
import { useState, useCallback, useRef, useEffect } from 'react'
import { Search, UserPlus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/hooks/use-debounce'
import { clientsApi } from '@/api/clients'
import { NewClientDialog } from '@/components/clients/new-client-dialog'
import { cn } from '@/lib/utils'
import type { Client } from '@/types/client'
import type { BookingDraftClient } from '@/types/booking'

function getDisplayName(c: BookingDraftClient | null): string {
  if (!c) return ''
  if ('firstName' in c && 'lastName' in c) {
    return `${(c as { firstName?: string }).firstName ?? ''} ${(c as { lastName?: string }).lastName ?? ''}`.trim()
  }
  return (c as { name?: string }).name ?? ''
}

function getClientName(c: Client): string {
  return `${c?.firstName ?? ''} ${c?.lastName ?? ''}`.trim() || 'Unknown'
}

function clientToDraft(c: Client): BookingDraftClient {
  return {
    id: c.id,
    firstName: c.firstName ?? '',
    lastName: c.lastName ?? '',
    email: c.email ?? undefined,
    phone: c.phone ?? undefined,
    vip: c.vip ?? false,
    family: c.family ?? false,
    country: c.country ?? undefined,
    notes: c.notes ?? undefined,
  }
}

export interface ClientSelectorProps {
  value: BookingDraftClient | null
  onChange: (client: BookingDraftClient | null) => void
  errors?: string[]
}

export function ClientSelector({ value, onChange, errors = [] }: ClientSelectorProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Client[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showNewClient, setShowNewClient] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const debouncedQuery = useDebounce(query, 300)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const q = (debouncedQuery ?? '').trim()
    if (!q) {
      setResults([])
      setIsSearching(false)
      return
    }
    setIsSearching(true)
    clientsApi
      .getClients({ search: q, limit: 8 })
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : []
        setResults(list)
      })
      .finally(() => setIsSearching(false))
  }, [debouncedQuery])

  const handleSelect = useCallback(
    (client: Client) => {
      onChange(clientToDraft(client))
      setQuery('')
      setResults([])
      setDropdownOpen(false)
    },
    [onChange]
  )

  const handleCreateSuccess = useCallback(
    (clientId: string) => {
      clientsApi.getClient(clientId).then((c) => {
        if (c) handleSelect(c)
      })
      setShowNewClient(false)
    },
    [handleSelect]
  )

  const handleClear = useCallback(() => {
    onChange(null)
    setQuery('')
    setResults([])
  }, [onChange])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const list = results ?? []
  const hasErrors = (errors ?? []).length > 0

  return (
    <Card className="transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="font-serif text-lg">Client Selection</CardTitle>
        <p className="text-sm text-muted-foreground">
          Search for an existing client or create a new one. Selected client details will auto-populate.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {value ? (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium">
                {getDisplayName(value)}
              </p>
              {value.email && (
                <p className="text-sm text-muted-foreground">{value.email}</p>
              )}
              {value.phone && (
                <p className="text-sm text-muted-foreground">{value.phone}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {value.vip && (
                  <span className="rounded bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent">
                    VIP
                  </span>
                )}
                {value.family && (
                  <span className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                    Family
                  </span>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleClear}>
              Change
            </Button>
          </div>
        ) : (
          <div ref={containerRef} className="relative">
            <Label htmlFor="client-search">Search clients</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                id="client-search"
                placeholder="Type name, email, or phone..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setDropdownOpen(true)
                  setHighlightedIndex(-1)
                }}
                onFocus={() => setDropdownOpen(true)}
                className="pl-9"
                aria-autocomplete="list"
                aria-controls="client-results"
                aria-expanded={dropdownOpen && list.length > 0}
              />
            </div>

            {dropdownOpen && (list.length > 0 || isSearching) && (
              <ul
                id="client-results"
                role="listbox"
                aria-label="Client search results"
                className={cn(
                  'absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-auto rounded-lg border border-border bg-card py-1 shadow-card animate-fade-in'
                )}
              >
                {isSearching ? (
                  <li className="px-4 py-3 text-sm text-muted-foreground">Searching…</li>
                ) : (
                  list.map((client, index) => (
                    <li
                      key={client.id}
                      role="option"
                      aria-selected={index === highlightedIndex}
                      className={cn(
                        'flex cursor-pointer items-center justify-between px-4 py-2.5 transition-colors',
                        index === highlightedIndex ? 'bg-accent/15' : 'hover:bg-secondary'
                      )}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        handleSelect(client)
                      }}
                    >
                      <div>
                        <span className="font-medium">{getClientName(client)}</span>
                        {client.email && (
                          <span className="ml-2 text-xs text-muted-foreground">{client.email}</span>
                        )}
                      </div>
                    </li>
                  ))
                )}
              </ul>
            )}

            <div className="mt-3 flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowNewClient(true)}
              >
                <UserPlus className="h-4 w-4" aria-hidden />
                Create New Client
              </Button>
            </div>
          </div>
        )}

        {hasErrors && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
            {(errors ?? []).map((msg, i) => (
              <p key={i} className="text-sm text-destructive">
                {msg}
              </p>
            ))}
          </div>
        )}
      </CardContent>

      <NewClientDialog
        open={showNewClient}
        onOpenChange={setShowNewClient}
        onSuccess={handleCreateSuccess}
      />
    </Card>
  )
}
