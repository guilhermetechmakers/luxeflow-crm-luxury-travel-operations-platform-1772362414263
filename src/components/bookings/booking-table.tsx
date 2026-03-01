/**
 * BookingTable - Table with ref, client, resort, dates, value, commission, balance, status, actions
 * Sticky headers, sortable, row hover, selection, per-row actions
 */
import { Link } from 'react-router-dom'
import { ExternalLink, Bell, FileText, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatShortDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { BookingSummary, BookingStatus } from '@/types/booking'

const STATUS_STYLES: Record<BookingStatus, string> = {
  quote: 'bg-secondary text-muted-foreground',
  confirmed: 'bg-accent/15 text-accent border-accent/30',
  pre_arrival: 'bg-blue-500/15 text-blue-700 border-blue-500/30',
  in_stay: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
  completed: 'bg-muted text-muted-foreground',
}

export interface BookingTableProps {
  bookings: BookingSummary[]
  isLoading: boolean
  onToggleSelect: (id: string) => void
  onToggleSelectAll: (ids: string[], checked: boolean) => void
  isAllSelected: (ids: string[]) => boolean
  isSomeSelected: (ids: string[]) => boolean
  isSelected: (id: string) => boolean
  onSendReminder?: (id: string) => void
  onCreateInvoice?: (id: string) => void
  onExport?: (id: string) => void
  isReminding?: boolean
  isInvoicing?: boolean
}


export function BookingTable({
  bookings,
  isLoading,
  onToggleSelect,
  onToggleSelectAll,
  isAllSelected,
  isSomeSelected,
  isSelected,
  onSendReminder,
  onCreateInvoice,
  onExport,
  isReminding,
  isInvoicing,
}: BookingTableProps) {
  const list = bookings ?? []
  const ids = list.map((b) => b.id).filter(Boolean)

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-14 animate-pulse rounded-lg bg-secondary/50"
            aria-hidden
          />
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full" role="table" aria-label="Bookings list">
        <thead className="sticky top-0 z-10 border-b border-border bg-secondary/80 backdrop-blur-sm">
          <tr>
            <th className="w-12 px-4 py-3 text-left" scope="col">
              <Checkbox
                checked={isAllSelected(ids)}
                aria-checked={isAllSelected(ids) ? 'true' : isSomeSelected(ids) ? 'mixed' : 'false'}
                onCheckedChange={(checked) => onToggleSelectAll(ids, checked === true)}
                aria-label="Select all bookings"
              />
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground" scope="col">
              Reference
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground" scope="col">
              Client
            </th>
            <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground md:table-cell" scope="col">
              Resort
            </th>
            <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground lg:table-cell" scope="col">
              Check-in
            </th>
            <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground lg:table-cell" scope="col">
              Check-out
            </th>
            <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground xl:table-cell" scope="col">
              Value
            </th>
            <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground xl:table-cell" scope="col">
              Commission
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground" scope="col">
              Balance
            </th>
            <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground md:table-cell" scope="col">
              Status
            </th>
            <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground lg:table-cell" scope="col">
              Last Updated
            </th>
            <th className="w-32 px-4 py-3 text-right" scope="col">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {list.map((booking) => (
            <tr
              key={booking.id}
              className="group border-b border-border transition-colors last:border-b-0 hover:bg-secondary/30"
            >
              <td className="px-4 py-3">
                <Checkbox
                  checked={isSelected(booking.id)}
                  onCheckedChange={() => onToggleSelect(booking.id)}
                  aria-label={`Select ${booking.booking_ref}`}
                  onClick={(e) => e.stopPropagation()}
                />
              </td>
              <td className="px-4 py-3">
                <Link
                  to={`/dashboard/bookings/${booking.id}`}
                  className="font-mono font-medium hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded-md -m-1 p-1"
                >
                  {booking.booking_ref ?? '—'}
                </Link>
              </td>
              <td className="px-4 py-3 font-medium">
                {booking.client_name ?? '—'}
              </td>
              <td className="hidden px-4 py-3 text-sm md:table-cell">
                {booking.resort_name ?? '—'}
              </td>
              <td className="hidden px-4 py-3 text-sm lg:table-cell">
                {formatShortDate(booking.check_in)}
              </td>
              <td className="hidden px-4 py-3 text-sm lg:table-cell">
                {formatShortDate(booking.check_out)}
              </td>
              <td className="hidden px-4 py-3 text-sm xl:table-cell">
                {formatCurrency(booking.value, booking.currency)}
              </td>
              <td className="hidden px-4 py-3 text-sm xl:table-cell">
                {formatCurrency(booking.commission, booking.currency)}
              </td>
              <td className="px-4 py-3 text-sm font-medium">
                {formatCurrency(booking.balance_due, booking.currency)}
              </td>
              <td className="hidden px-4 py-3 md:table-cell">
                <Badge variant="outline" className={cn('text-xs', STATUS_STYLES[booking.status] ?? '')}>
                  {booking.status?.replace('_', '-') ?? '—'}
                </Badge>
              </td>
              <td className="hidden px-4 py-3 text-sm text-muted-foreground lg:table-cell">
                {formatShortDate(booking.last_updated)}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button variant="ghost" size="icon" asChild aria-label={`Open ${booking.booking_ref}`}>
                    <Link to={`/dashboard/bookings/${booking.id}`}>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                  {onSendReminder && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onSendReminder(booking.id)}
                      disabled={isReminding}
                      aria-label={`Send reminder for ${booking.booking_ref}`}
                    >
                      <Bell className="h-4 w-4" />
                    </Button>
                  )}
                  {onCreateInvoice && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onCreateInvoice(booking.id)}
                      disabled={isInvoicing}
                      aria-label={`Create invoice for ${booking.booking_ref}`}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  )}
                  {onExport && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onExport(booking.id)}
                      aria-label={`Export ${booking.booking_ref}`}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
