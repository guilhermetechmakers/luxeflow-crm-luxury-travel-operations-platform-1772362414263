/**
 * LinkContextPicker - Quick search for bookings and clients to link in a message
 */
import { useState, useEffect } from 'react'
import { Search, FileText, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { bookingsApi } from '@/api/bookings'
import { clientsApi } from '@/api/clients'
import type { BookingSummary } from '@/types/booking'
import type { Client } from '@/types/client'

export interface LinkContextPickerProps {
  searchTerm: string
  onSelectBooking: (booking: { id: string; reference?: string }) => void
  onSelectClient: (client: { id: string; name?: string }) => void
  onClose?: () => void
}

export function LinkContextPicker({
  searchTerm: initialSearch,
  onSelectBooking,
  onSelectClient,
  onClose,
}: LinkContextPickerProps) {
  const [search, setSearch] = useState(initialSearch)
  const [bookings, setBookings] = useState<BookingSummary[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const q = (search ?? '').trim()
    if (q.length < 2) {
      setBookings([])
      setClients([])
      return
    }
    let cancelled = false
    setLoading(true)
    Promise.all([
      bookingsApi.getBookings({ search: q, pageSize: 5 }),
      clientsApi.getClients({ search: q, limit: 5 }),
    ]).then(([bRes, cRes]) => {
      if (cancelled) return
      setBookings(Array.isArray(bRes?.data) ? bRes.data : [])
      setClients(Array.isArray(cRes?.data) ? cRes.data : [])
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [search])

  const bookingList = (bookings ?? []).slice(0, 5)
  const clientList = (clients ?? []).slice(0, 5)

  return (
    <div className="w-80 rounded-lg border border-border bg-card shadow-card overflow-hidden">
      <div className="p-2 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            placeholder="Search bookings or clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9"
            autoFocus
            aria-label="Search for booking or client"
          />
        </div>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
        ) : (
          <>
            {bookingList.length > 0 && (
              <div className="p-2">
                <p className="px-2 py-1 text-xs font-medium uppercase text-muted-foreground">Bookings</p>
                {(bookingList ?? []).map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      onSelectBooking({ id: b.id, reference: b.booking_ref })
                      onClose?.()
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary transition-colors"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{b.booking_ref}</p>
                      <p className="text-xs text-muted-foreground truncate">{b.client_name} · {b.resort_name}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {clientList.length > 0 && (
              <div className="p-2 border-t border-border">
                <p className="px-2 py-1 text-xs font-medium uppercase text-muted-foreground">Clients</p>
                {(clientList ?? []).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onSelectClient({ id: c.id, name: [c.firstName, c.lastName].filter(Boolean).join(' ') })
                      onClose?.()
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary transition-colors"
                  >
                    <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">
                        {[c.firstName, c.lastName].filter(Boolean).join(' ') || c.email || 'Unknown'}
                      </p>
                      {c.email && (
                        <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {!loading && search.length >= 2 && bookingList.length === 0 && clientList.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">No results found</div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
