/**
 * ResultsPanel - Table with Name, Next Trip, Status, Balance, Last Contact, VIP, Country
 * Sticky headers, sortable, row hover, click to Client Detail, quick-create Booking
 */
import { Link } from 'react-router-dom'
import { CalendarPlus, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatShortDate } from '@/lib/format'
import type { Client } from '@/types/client'

function getClientName(client: Client): string {
  return `${client?.firstName ?? ''} ${client?.lastName ?? ''}`.trim() || 'Unknown'
}

function getInitials(client: Client): string {
  const f = (client?.firstName ?? '').charAt(0)
  const l = (client?.lastName ?? '').charAt(0)
  return (f + l).toUpperCase() || '?'
}

export interface ClientsResultsPanelProps {
  clients: Client[]
  isLoading: boolean
  onToggleSelect: (id: string) => void
  onToggleSelectAll: (ids: string[], checked: boolean) => void
  isAllSelected: (ids: string[]) => boolean
  isSomeSelected: (ids: string[]) => boolean
  isSelected: (id: string) => boolean
}

export function ClientsResultsPanel({
  clients,
  isLoading,
  onToggleSelect,
  onToggleSelectAll,
  isAllSelected,
  isSomeSelected,
  isSelected,
}: ClientsResultsPanelProps) {
  const list = clients ?? []
  const ids = list.map((c) => c.id).filter(Boolean)

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-lg bg-secondary/50"
            aria-hidden
          />
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full" role="table" aria-label="Clients list">
        <thead className="sticky top-0 z-10 border-b border-border bg-secondary/80 backdrop-blur-sm">
          <tr>
            <th className="w-12 px-4 py-3 text-left" scope="col">
              <Checkbox
                checked={isAllSelected(ids)}
                aria-checked={isAllSelected(ids) ? 'true' : isSomeSelected(ids) ? 'mixed' : 'false'}
                onCheckedChange={(checked) =>
                  onToggleSelectAll(ids, checked === true)
                }
                aria-label="Select all clients"
              />
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground" scope="col">
              Name
            </th>
            <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground md:table-cell" scope="col">
              Next Trip
            </th>
            <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground lg:table-cell" scope="col">
              Status
            </th>
            <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground lg:table-cell" scope="col">
              Balance
            </th>
            <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground xl:table-cell" scope="col">
              Last Contact
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground" scope="col">
              VIP
            </th>
            <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground md:table-cell" scope="col">
              Country
            </th>
            <th className="w-24 px-4 py-3 text-right" scope="col">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {list.map((client) => (
            <tr
              key={client.id}
              className="group border-b border-border transition-colors last:border-b-0 hover:bg-secondary/30"
            >
              <td className="px-4 py-3">
                <Checkbox
                  checked={isSelected(client.id)}
                  onCheckedChange={() => onToggleSelect(client.id)}
                  aria-label={`Select ${getClientName(client)}`}
                  onClick={(e) => e.stopPropagation()}
                />
              </td>
              <td className="px-4 py-3">
                <Link
                  to={`/dashboard/clients/${client.id}`}
                  className="flex items-center gap-3 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded-md -m-1 p-1"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-xs">
                      {getInitials(client)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-medium">{getClientName(client)}</span>
                    {client.email && (
                      <span className="ml-2 hidden text-sm text-muted-foreground md:inline">
                        {client.email}
                      </span>
                    )}
                  </div>
                </Link>
              </td>
              <td className="hidden px-4 py-3 text-sm md:table-cell">
                {formatShortDate(client.nextTripDate)}
              </td>
              <td className="hidden px-4 py-3 lg:table-cell">
                <Badge variant="secondary" className="capitalize">
                  {client.status}
                </Badge>
              </td>
              <td className="hidden px-4 py-3 text-sm lg:table-cell">
                {formatCurrency(client.outstandingBalance)}
              </td>
              <td className="hidden px-4 py-3 text-sm text-muted-foreground xl:table-cell">
                {formatShortDate(client.lastContact)}
              </td>
              <td className="px-4 py-3">
                {client.vip && (
                  <Badge variant="default" className="bg-luxe-supporting/20 text-luxe-supporting">
                    VIP
                  </Badge>
                )}
              </td>
              <td className="hidden px-4 py-3 text-sm text-muted-foreground md:table-cell">
                {client.country ?? '—'}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    aria-label={`New booking for ${getClientName(client)}`}
                  >
                    <Link to={`/dashboard/bookings/new?client=${client.id}`}>
                      <CalendarPlus className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    aria-label={`View history for ${getClientName(client)}`}
                  >
                    <Link to={`/dashboard/clients/${client.id}`}>
                      <History className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
